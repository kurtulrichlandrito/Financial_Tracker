from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import *
from django.contrib.auth import authenticate, login, logout
from .utils.data_extraction import data_extractor
from .utils.group_by_description import get_or_create_group
import json
from decimal import Decimal
from datetime import date
from django.db.models import F, Q, Sum

DEFAULT_TRANSACTION_ORDERING = '-transaction_date'
TRANSACTION_ORDERING_FIELDS = {
    'transaction_date',
}


def get_transaction_ordering(request):
    ordering = request.GET.get('orderby') or request.GET.get('order_by')

    if not ordering:
        return DEFAULT_TRANSACTION_ORDERING

    field = ordering.removeprefix('-')
    if field not in TRANSACTION_ORDERING_FIELDS:
        return DEFAULT_TRANSACTION_ORDERING

    return ordering


def validate_transaction_relationships(serializer, user):
    account = serializer.validated_data.get('account')
    if account is not None and account.user_id != user.id:
        return Response(
            {'Message': 'Account not found'},
            status=status.HTTP_404_NOT_FOUND)

    transaction_category = serializer.validated_data.get('transaction_category')
    if transaction_category is not None and transaction_category.user_id != user.id:
        return Response(
            {'Message': 'Category not found'},
            status=status.HTTP_404_NOT_FOUND)

    return None

# Create your views here.
class CreateUser(APIView):
    serializer_class = UserSerializer
    def post(self, request, format=None):
        serializer = UserSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
            serializer.errors, 
            status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=request.data.get('email')).exists():
            return Response(
            {'Message': 'Email already Exists'},
            status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
  
class LoginUser(APIView):
    serializer_class = UserSerializer
    def post(self, request, format=None):
        username = request.data.get('username')
        password = request.data.get('password')

        if username and '@' in username:
            user_by_email = User.objects.filter(email=username).first()
            if user_by_email:
                username = user_by_email.username

        user = authenticate(request, 
                            username=username, 
                            password=password)
        if user is None:
            return Response(
            {'Message': 'Invalid Credentials'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        login(request, user)
        return Response(
            {'Message': 'Login Successful'}, 
            status=status.HTTP_200_OK)

class LogoutUser(APIView):
    def post(self, request, format=None):
        logout(request)
        return Response(
            {'Message': 'Logout Successful'}, 
            status=status.HTTP_200_OK)

class CheckAuth(APIView):
    def get(self, request, format=None):
        if self.request.user.is_authenticated:
            return Response({'isAuthenticated': True})
            
        return Response({'isAuthenticated': False})

class Accounts(APIView):
    serializer_class = AccountSerializer
    def post(self, request, format=None):
        serializer = AccountSerializer(data=request.data)
        user=self.request.user
        if not user.is_authenticated:
            return Response(
                {'Message': 'User Not Does not Exist'}, 
                status=status.HTTP_401_UNAUTHORIZED)
        
        if not serializer.is_valid():
            return Response(
            {'Message': 'Invalid Request'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        exists = Account.objects.filter(
                user=user,
                account_type=request.data.get('account_type'),
                account_nickname=request.data.get('account_nickname')
                ).exists()
        
        if exists:
            return Response(
            {'Message': 'Account Already Exists'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        if request.data.get('account_type') == 'credit':
            liability = {'liability_name': request.data.get('account_nickname'),
                         'liability_amount': request.data.get('balance')}
            liability_serializer = LiabilitySerializer(data=liability)

            if not liability_serializer.is_valid():
                return Response(
                {'Message': 'Failed to add Account as Liability'}, 
                status=status.HTTP_200_OK)
            liability_serializer.save(user=user)
        else:
            asset = {'asset_name': request.data.get('account_nickname'),
                         'asset_amount': request.data.get('balance')}
            asset_serializer = AssetSerializer(data=asset)
            if not asset_serializer.is_valid():
                return Response(
                {'Message': 'Failed to add Account as Asset'}, 
                status=status.HTTP_200_OK)
            asset_serializer.save(user=user)

        serializer.save(user=user)

        return Response(
            {'Message': 'Added Account'}, 
            status=status.HTTP_200_OK)
        
    def get(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        accounts = Account.objects.all().filter(user=user)
        serializer = AccountSerializer(accounts, many=True)
        return Response(
            serializer.data, 
            status=status.HTTP_200_OK)

    def patch(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_401_UNAUTHORIZED)

        account_id = request.GET.get('id') or request.data.get('id')
        if not account_id:
            return Response(
            {'Message': 'Account id is required'}, 
            status=status.HTTP_400_BAD_REQUEST)

        account = Account.objects.filter(
            id=account_id,
            user=user
        ).first()

        if account is None:
            return Response(
            {'Message': 'Account not found'}, 
            status=status.HTTP_404_NOT_FOUND)

        serializer = AccountSerializer(
            account,
            data=request.data,
            partial=True
        )

        if not serializer.is_valid():
            return Response(
            serializer.errors, 
            status=status.HTTP_400_BAD_REQUEST)

        serializer.save(user=user)

        return Response(
            {
                'Message': 'Account updated',
                'account': serializer.data
            }, 
            status=status.HTTP_200_OK)

    def delete(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_401_UNAUTHORIZED)

        account_ids = request.data.get('items') or []
        accounts = Account.objects.filter(user=user, id__in=account_ids)
        deleted_count = accounts.count()
        accounts.delete()

        return Response(
            {'Message': f'{deleted_count} Deleted'}, 
            status=status.HTTP_200_OK)

class Transactions(APIView):
    def post(self, request, format=None):
        user = self.request.user
        serializer = TransactionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
            {'Message': 'Invalid Request'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        if not user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_400_BAD_REQUEST)

        ownership_error = validate_transaction_relationships(serializer, user)
        if ownership_error:
            return ownership_error
        
        account_id = request.GET.get('account_id') or request.data.get('account_id')
        account_instance = Account.objects.filter(
            id=account_id,
            user=user
        ).first()
        amount = (request.data.get('transaction_amount') or
            request.GET.get('transaction_amount'))
        
        Account.objects.filter(id=account_instance.id, user=user).update(
            balance = F('balance') + Decimal(amount), 
            date_updated= date.today())
        serializer.save(user=user)

        serializer.save(user=user)
        return Response(
            {'Message': 'Added Transaction'}, 
            status=status.HTTP_200_OK)
    
    def get(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        transaction_type = request.GET.get('type')

        transactions = Transaction.objects.all().filter(user=user)

        if transaction_type != 'all':
            transactions = transactions.filter(transaction_type=transaction_type)

        transactions = transactions.order_by(get_transaction_ordering(request))
        
        serializer = TransactionSerializer(transactions, many=True)
        return Response(
            serializer.data, 
            status=status.HTTP_200_OK)
    
    def delete(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        transaction_type = request.GET.get('type')
        transaction_ids = request.data.get('items')
        transactions = Transaction.objects.all().filter(user=user, 
                                                        transaction_type=transaction_type,
                                                         id__in=transaction_ids)
        
        transactions.delete()

        return Response(
            {'Message': f'{len(transactions)} Deleted'}, 
            status=status.HTTP_200_OK)
    
    def patch(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
                {'Message': 'Unauthorized'}, 
                status=status.HTTP_401_UNAUTHORIZED)
        
        transaction_id = request.GET.get('id') or request.data.get('id')
        if not transaction_id:
            return Response(
                {'Message': 'Transaction id is required'}, 
                status=status.HTTP_400_BAD_REQUEST)

        transaction = Transaction.objects.filter(
            id=transaction_id,
            user=user
        ).first()

        if transaction is None:
            return Response(
                {'Message': 'Transaction not found'}, 
                status=status.HTTP_404_NOT_FOUND)

        serializer = TransactionSerializer(
            transaction,
            data=request.data,
            partial=True
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST)

        ownership_error = validate_transaction_relationships(serializer, user)
        if ownership_error:
            return ownership_error

        serializer.save(user=user)

        return Response(
            {
                'Message': 'Transaction updated',
                'transaction': serializer.data
            }, 
            status=status.HTTP_200_OK)

class TransactionImport(APIView):
    def post(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
                {'Message': 'User Not Does not Exist'}, 
                status=status.HTTP_401_UNAUTHORIZED)
        account = json.loads(request.data.get('account'))
        account_serializer = AccountSerializer(data=account)
        
        if not account_serializer.is_valid():
            return Response(
                {'Message': 'Account is not valid'}, 
                status=status.HTTP_400_BAD_REQUEST) 

        account_instance = Account.objects.filter(
            id=account.get('id'),
            user=user
        ).first()
        if account_instance is None:
            return Response(
                {'Message': 'Account not found'}, 
                status=status.HTTP_404_NOT_FOUND)
        
        file = self.request.FILES.get('file')
        data = data_extractor(file, account['account_type'])

        if not data:
            return Response(
                {'Message': 'File uploaded is not valid'}, 
                status=status.HTTP_400_BAD_REQUEST)  
         
        has_invalid = False
        has_duplicate = False
        for transaction in data:
            transaction['account_id'] = account_instance.id
            serializer = TransactionSerializer(data=transaction)
            if not serializer.is_valid():
                has_invalid = True
                continue

            exists = Transaction.objects.filter(
            user=user,
            **transaction
            ).exists()
            if exists:
                has_duplicate = True
                continue
        
            amount = transaction.get('transaction_amount')

            Account.objects.filter(id=account_instance.id, user=user).update(
                balance = F('balance') + Decimal(amount), 
                date_updated= date.today())
            serializer.save(user=user)
                
        if has_invalid:
            return Response(
                {'Message': 'Some transactions have invalid fields'}, 
                status=status.HTTP_400_BAD_REQUEST)
        elif has_duplicate:
            return Response(
                {'Message': 'Some Transactions Already Exists'}, 
                status=status.HTTP_200_OK)
        
        return Response(
            {'Message': 'All Transactions Imported Successfully'}, 
            status=status.HTTP_200_OK)

class Categories(APIView):
    serializer_class = CategorySerializer
    def post(self, request, format=None):
        serializer = CategorySerializer(data=request.data)
        user = self.request.user
        if not user.is_authenticated:
            return Response(
                {'Message': 'User Not Does not Exist'}, 
                status=status.HTTP_401_UNAUTHORIZED)
        
        if not serializer.is_valid():
            return Response(
            {'Message': 'Invalid Request'}, 
            status=status.HTTP_400_BAD_REQUEST)
            
        transaction_category = request.data.get('transaction_category')
        exists = Category.objects.filter(
            user=request.user, 
            transaction_category=transaction_category).exists()
        
        if exists:
            return Response(
            {'Message': 'Category Already Exists'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save(user=user)
        return Response(
            {'Message': 'Added Transaction Category'}, 
            status=status.HTTP_200_OK)
    
    def get(self, request, format=None):
        user= self.request.user
        if not user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_400_BAD_REQUEST)
        type = request.GET.get('type')
        categories = Category.objects.all().filter(user=user)

        if type:
            categories = categories.filter(transaction_type=type)

        serializer = CategorySerializer(categories, many=True)
        
        return Response(
            serializer.data, 
            status=status.HTTP_200_OK)

class GetGroupedTransactions(APIView):
    def get(self, request, format=None):
        transaction_type = request.GET.get('type')
        user = self.request.user
        if not user.is_authenticated:
            return Response(
                {'Message': 'Unauthorized'}, 
                status=status.HTTP_401_UNAUTHORIZED)
        
        transactions = Transaction.objects.all().filter(user=request.user, 
                                               transaction_category=None, 
                                               transaction_type=transaction_type
                                               ).order_by(get_transaction_ordering(request))
        grouped = {}
        for transaction in transactions:
            key = transaction.transaction_notes.upper().strip()
            matched_key = get_or_create_group(grouped, key)
            if matched_key not in grouped:
                rule = CategoryRule.objects.filter(
            user=request.user,
            keyword__icontains=matched_key
            ).first()
                grouped[matched_key] = {
                    'transaction': [],
                    'suggested_category': rule.transaction_category.transaction_category if rule else None
                }
            grouped[matched_key]['transaction'].append(TransactionSerializer(transaction).data)
        
        return Response(grouped, status=status.HTTP_200_OK)

class BatchCategorizeTransactions(APIView):
    def patch(self, request, format=None):
            user = self.request.user
            if not user.is_authenticated:
                return Response(
                    {'Message': 'Unauthorized'}, 
                    status=status.HTTP_401_UNAUTHORIZED)
            
            data = self.request.data
            for item in data:
                category = item.get('category')
                category_id = Category.objects.get(transaction_category=category, 
                                                        user=self.request.user)
                transaction_ids = item.get('transaction_Ids')
                transaction = Transaction.objects.all().filter(
                    user=user,
                    id__in=transaction_ids)
                transaction.update(
                    transaction_category=category_id)

                first_transaction = transaction.first()
                if first_transaction is not None:
                    CategoryRule.objects.get_or_create(
                        transaction_category=category_id,
                        user=user,
                        keyword=first_transaction.transaction_notes
                    )
                
            return Response(
                {'Message': 'Categories updated'}, 
                status=status.HTTP_200_OK)

class Assets(APIView):
    serializer_class = AssetSerializer

    def post(self, request, format=None):
        serializer = AssetSerializer(data=request.data)
        user = self.request.user
        if not user.is_authenticated:
            return Response(
                {'Message': 'User Not Does not Exist'}, 
                status=status.HTTP_400_BAD_REQUEST)
        
        if not serializer.is_valid():
            return Response(
            {'Message': 'Invalid Request'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save(user=user)
        return Response(
            {'Message': 'Added Asset'}, 
            status=status.HTTP_200_OK)

    def get(self, request, format=None):
        if not self.request.user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        asset = Asset.objects.filter(user=self.request.user)
        serializer = AssetSerializer(asset, many=True)
        return Response(
            serializer.data, 
            status=status.HTTP_200_OK)

    def patch(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_401_UNAUTHORIZED)

        asset_id = request.GET.get('id') or request.data.get('id')
        if not asset_id:
            return Response(
            {'Message': 'Asset id is required'}, 
            status=status.HTTP_400_BAD_REQUEST)

        asset = Asset.objects.filter(id=asset_id, user=user).first()
        if asset is None:
            return Response(
            {'Message': 'Asset not found'}, 
            status=status.HTTP_404_NOT_FOUND)

        serializer = AssetSerializer(asset, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(
            serializer.errors, 
            status=status.HTTP_400_BAD_REQUEST)

        serializer.save(user=user)
        return Response(
            {
                'Message': 'Asset updated',
                'asset': serializer.data
            }, 
            status=status.HTTP_200_OK)

    def delete(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_401_UNAUTHORIZED)

        asset_ids = request.data.get('items') or []
        assets = Asset.objects.filter(user=user, id__in=asset_ids)
        deleted_count = assets.count()
        assets.delete()

        return Response(
            {'Message': f'{deleted_count} Deleted'}, 
            status=status.HTTP_200_OK)
                
class Liabilities(APIView):
    serializer_class = LiabilitySerializer
    def post(self, request, format=None):
        serializer = LiabilitySerializer(data=request.data)
        user = self.request.user
        if not user.is_authenticated:
            return Response(
                {'Message': 'User Not Does not Exist'}, 
                status=status.HTTP_401_UNAUTHORIZED)
        
        if serializer.is_valid():
            
            serializer.save(user=user)
            return Response(
                {'Message': 'Added Liability'}, 
                status=status.HTTP_200_OK)
    
    def get(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        liability = Liability.objects.filter(user=user)
        serializer = LiabilitySerializer(liability, many=True)
        return Response(
            serializer.data, 
            status=status.HTTP_200_OK)

    def patch(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_401_UNAUTHORIZED)

        liability_id = request.GET.get('id') or request.data.get('id')
        if not liability_id:
            return Response(
            {'Message': 'Liability id is required'}, 
            status=status.HTTP_400_BAD_REQUEST)

        liability = Liability.objects.filter(id=liability_id, user=user).first()
        if liability is None:
            return Response(
            {'Message': 'Liability not found'}, 
            status=status.HTTP_404_NOT_FOUND)

        serializer = LiabilitySerializer(liability, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(
            serializer.errors, 
            status=status.HTTP_400_BAD_REQUEST)

        serializer.save(user=user)
        return Response(
            {
                'Message': 'Liability updated',
                'liability': serializer.data
            }, 
            status=status.HTTP_200_OK)

    def delete(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_401_UNAUTHORIZED)

        liability_ids = request.data.get('items') or []
        liabilities = Liability.objects.filter(user=user, id__in=liability_ids)
        deleted_count = liabilities.count()
        liabilities.delete()

        return Response(
            {'Message': f'{deleted_count} Deleted'}, 
            status=status.HTTP_200_OK)

class NetWorth(APIView):
    def get(self, request,format=None):

        user=self.request.user
        if not user.is_authenticated:
            return Response(
                {'Message': 'User Not Does not Exist'}, 
                status=status.HTTP_401_UNAUTHORIZED)
        
        total_asset = sum(asset['asset_amount'] 
                          for asset in Asset.objects.values().filter(user=user))
        total_liabilities = sum(liability['liability_amount'] 
                              for liability in Liability.objects.values().filter(user=user))
        
        net_worth = total_asset - total_liabilities

        data = {
            'total_assets' : total_asset,
            'total_liabilities' : total_liabilities,
            'net_worth' : net_worth
        }

        serializer = NetWorthSerializer(data)

        return Response(serializer.data, status=status.HTTP_200_OK)

class Search(APIView):
    def get(self, request, format=None):
        user=self.request.user
        if not user.is_authenticated:
            return Response(
                {'Message': 'User Not Does not Exist'}, 
                status=status.HTTP_401_UNAUTHORIZED)
        
        search_value = self.request.GET.get("search_value")
        account_id = self.request.GET.get("account_id")
        category_id = self.request.GET.get("category")
        type = self.request.GET.get("type")
        date_start = self.request.GET.get("date_start")

        search_value = search_value.strip() if search_value else None
        account_id = None if account_id in [None, "", "all"] else account_id
        category_id = None if category_id in [None, "", "all"] else category_id
        type = None if type in [None, "", "all"] else type
        date_start = None if date_start in [None, "", "all"] else date_start  

        transactions = Transaction.objects.all().filter(user=user)

        if account_id:
            transactions = transactions.filter(account_id=account_id)
        
        if type:
            transactions = transactions.filter(transaction_type=type)

        if search_value:
            transactions.filter(Q(transaction_notes__icontains=search_value))

        if date_start:
            transactions = transactions.filter(transaction_date__gte=date_start)

        transactions = transactions.order_by(get_transaction_ordering(request))

        serializer = TransactionSerializer(transactions, many=True)
        return Response(
            serializer.data, 
            status=status.HTTP_200_OK)

class Reports(APIView):
    def get(self, request, format=None):
        user=self.request.user
        if not user.is_authenticated:
            return Response(
                {'Message': 'User Not Does not Exist'}, 
                status=status.HTTP_401_UNAUTHORIZED)
        
        account_id = self.request.GET.get('account_id')
        date_start = self.request.GET.get('date_start')
        
        account_id = None if account_id in [None, "", "all"] else account_id
        date_start = None if date_start in [None, "", "all"] else date_start 
        
        transactions = Transaction.objects.all().filter(user=user)
        
        if account_id:
            transactions = transactions.filter(account_id=account_id)

        if date_start:
            transactions = transactions.filter(transaction_date__gte=date_start)

        transactions = transactions.order_by(get_transaction_ordering(request))

        total_expense = transactions.filter(transaction_type='expense'
        ).aggregate(total=Sum('transaction_amount'))['total'] 

        total_income = transactions.filter(transaction_type='income'
        ).aggregate(total=Sum('transaction_amount'))['total'] 
        expenseCategoryTotals = {}
        incomeCategoryTotals = {}
        for transaction in transactions.values():
            
            category = Category.objects.filter(
                id=transaction['transaction_category_id']
                ).values_list('transaction_category', flat=True).first()

            if transaction['transaction_type'] == 'expense':
                expenseCategoryTotals[category] = (expenseCategoryTotals.get(category, 0) 
                + transaction['transaction_amount'])
            elif transaction['transaction_type'] == 'income':
                incomeCategoryTotals[category] = (incomeCategoryTotals.get(category, 0) 
                + transaction['transaction_amount'])

        data = {'total_expense' : total_expense, 
                'total_income': total_income,
                'expenseCategoryTotals': expenseCategoryTotals,
                'incomeCategoryTotals': incomeCategoryTotals}
        
        return Response(data, 
            status=status.HTTP_200_OK) 

        
