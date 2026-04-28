from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import *
from django.contrib.auth import authenticate, login, logout
from .utils.data_extraction import data_extractor
from .utils.group_by_description import get_or_create_group
from .utils.categorizer import get_model_and_serializer
import json
from decimal import Decimal
from django.db.models import F

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
   
class Expenses(APIView):
    serializer_class = ExpenseSerializer
    def post(self, request, format=None):
        serializer = ExpenseSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
            {'Message': 'Invalid Request'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        if not self.request.user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        return Response(
            {'Message': 'Added Expense'}, 
            status=status.HTTP_200_OK)
    
    def get(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        expenses = Expense.objects.all().filter(user=user)
        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
                {'Message': 'Unauthorized'}, 
                status=status.HTTP_401_UNAUTHORIZED)
        
        data = self.request.data
        for item in data:
            category = item.get('category')
            category_id = ExpenseCategory.objects.get(expense_category=category, 
                                                      user=self.request.user)
            expense_ids = item.get('expenseIds')
            expense = Expense.objects.filter(id__in=expense_ids)
            expense.update(
                expense_category=category_id)
            ExpenseCategoryRule.objects.get_or_create(
                category=category_id,
                user=user,
                keyword=expense.first().expense_notes
            )
            
        return Response(
            {'Message': 'Categories updated'}, 
            status=status.HTTP_200_OK)
    
    def delete(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
                {'Message': 'Unauthorized'}, 
                status=status.HTTP_401_UNAUTHORIZED)
        items = self.request.data.get('items')

        for item in items:
            Expense.objects.all().filter(user=user,
                                                id=item).delete()
            
        return Response(
        {'Message': 'Items deleted'}, 
        status=status.HTTP_200_OK)

class Incomes(APIView):
    serializer_class = IncomeSerializer
    def post(self, request, format=None):
        serializer = IncomeSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
            {'Message': 'Invalid Request'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        if not self.request.user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        return Response(
            {'Message': 'Added Income'}, 
            status=status.HTTP_200_OK)
    
    def get(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        incomes = Income.objects.all().filter(user=user)
        serializer = IncomeSerializer(incomes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
                {'Message': 'Unauthorized'}, 
                status=status.HTTP_401_UNAUTHORIZED)
        
        data = self.request.data
        for item in data:
            category = item.get('category')
            category_id = IncomeCategory.objects.get(income_category=category, 
                                                      user=self.request.user)
            income_ids = item.get('incomeIds')
            income = Income.objects.filter(id__in=income_ids)
            income.update(
                income_category=category_id)
            IncomeCategoryRule.objects.get_or_create(
                category=category_id,
                user=user,
                keyword=income.first().income_notes
            )
            
        return Response(
            {'Message': 'Categories updated'}, 
            status=status.HTTP_200_OK)

    def delete(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
                {'Message': 'Unauthorized'}, 
                status=status.HTTP_401_UNAUTHORIZED)
        items = self.request.data.get('items')

        for item in items:
            Income.objects.all().filter(user=user,
                                                id=item).delete()
            
        return Response(
        {'Message': 'Items deleted'}, 
        status=status.HTTP_200_OK)

class IncomeCategories(APIView):
    serializer_class = IncomeCategorySerializer
    def post(self, request, format=None):
        serializer = IncomeCategorySerializer(data=request.data)
        user = self.request.user
        if not user.is_authenticated:
            return Response(
                {'Message': 'User Not Does not Exist'}, 
                status=status.HTTP_401_UNAUTHORIZED)
        print(serializer)
        if not serializer.is_valid():
            
            return Response(
            {'Message': 'Invalid Request'}, 
            status=status.HTTP_400_BAD_REQUEST)
            
        income_category = request.data.get('income_category')
        exists = IncomeCategory.objects.filter(
            user=request.user, 
            income_category=income_category).exists()
        
        if exists:
            return Response(
            {'Message': 'Category Already Exists'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save(user=user)
        return Response(
            {'Message': 'Added Income Category'}, 
            status=status.HTTP_200_OK)
    
    def get(self, request, format=None):
        if not self.request.user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        categories = IncomeCategory.objects.all()
        serializer = IncomeCategorySerializer(categories, many=True)
        return Response(
            serializer.data, 
            status=status.HTTP_200_OK)

class ExpenseCategories(APIView):
    serializer_class = ExpenseCategorySerializer
    def post(self, request, format=None):
        serializer = ExpenseCategorySerializer(data=request.data)
        user = self.request.user
        if not user.is_authenticated:
            return Response(
                {'Message': 'User Not Does not Exist'}, 
                status=status.HTTP_401_UNAUTHORIZED)
        print(serializer)
        if not serializer.is_valid():
            return Response(
            {'Message': 'Invalid Request'}, 
            status=status.HTTP_400_BAD_REQUEST)
            
        expense_category = request.data.get('expense_category')
        exists = ExpenseCategory.objects.filter(
            user=request.user, 
            expense_category=expense_category).exists()
        
        if exists:
            return Response(
            {'Message': 'Category Already Exists'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save(user=user)
        return Response(
            {'Message': 'Added Expense Category'}, 
            status=status.HTTP_200_OK)
    
    def get(self, request, format=None):
        if not self.request.user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        categories = ExpenseCategory.objects.all()
        serializer = ExpenseCategorySerializer(categories, many=True)
        return Response(
            serializer.data, 
            status=status.HTTP_200_OK)

class ImportExpenses(APIView):

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
        
        file = self.request.FILES.get('file')
        data = data_extractor(file, account['account_type'])

        if not data:
            return Response(
                {'Message': 'File uploaded is not valid'}, 
                status=status.HTTP_400_BAD_REQUEST)  
         
        has_invalid = False
        has_duplicate = False
        for transaction in data:
            model, serializer = get_model_and_serializer(transaction)
            serializer = serializer(data=transaction)
            if not serializer.is_valid():
                has_invalid = True
                continue

            exists = model.objects.filter(
            user=user,
            **transaction
            ).exists()
            if exists:
                has_duplicate = True
                continue
        
            amount = transaction.get('expense_amount'
                ) or transaction.get('income_amount')

            Account.objects.filter(id=account.get('id')).update(
                balance = F('balance') + Decimal(amount))

            serializer.save(user=user)
                
        if has_invalid:
            return Response(
                {'Message': 'Some transactions have invalid fields'}, 
                status=status.HTTP_400_BAD_REQUEST)
        elif has_duplicate:
            print('duplicate: ',transaction)
            return Response(
                {'Message': 'Some Transactions Already Exists'}, 
                status=status.HTTP_200_OK)
        
        return Response(
            {'Message': 'All Transactions Imported Successfully'}, 
            status=status.HTTP_200_OK)
           
class GetGroupedExpenses(APIView):
    def get(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
                {'Message': 'Unauthorized'}, 
                status=status.HTTP_401_UNAUTHORIZED)
        
        expenses = Expense.objects.filter(user=request.user, 
                                          expense_category=None)
        
        grouped = {}
        for expense in expenses:
            key = expense.expense_notes.upper().strip()
            matched_key = get_or_create_group(grouped, key)
            if matched_key not in grouped:
                rule = ExpenseCategoryRule.objects.filter(
            user=request.user,
            keyword__icontains=matched_key
            ).first()
                grouped[matched_key] = {
                    'expense': [],
                    'suggested_category': rule.category.expense_category if rule else None
                }
            grouped[matched_key]['expense'].append(ExpenseSerializer(expense).data)
        
        return Response(grouped, status=status.HTTP_200_OK)

class GetGroupedIncomes(APIView):
    def get(self, request, format=None):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
                {'Message': 'Unauthorized'}, 
                status=status.HTTP_401_UNAUTHORIZED)
        
        incomes = Income.objects.filter(user=request.user, 
                                          income_category=None)
        
        grouped = {}
        for income in incomes:
            key = income.income_notes.upper().strip()
            matched_key = get_or_create_group(grouped, key)
            if matched_key not in grouped:
                rule = IncomeCategoryRule.objects.filter(
            user=request.user,
            keyword__icontains=matched_key
            ).first()
                grouped[matched_key] = {
                    'income': [],
                    'suggested_category': rule.category.income_category if rule else None
                }
            grouped[matched_key]['income'].append(IncomeSerializer(income).data)
        
        return Response(grouped, status=status.HTTP_200_OK)

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
        
        asset = Asset.objects.all()
        serializer = AssetSerializer(asset, many=True)
        return Response(
            serializer.data, 
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
        if not self.request.user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        liability = Liability.objects.all()
        serializer = LiabilitySerializer(liability, many=True)
        return Response(
            serializer.data, 
            status=status.HTTP_200_OK)

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
            print(serializer.data)
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
        serializer.save(user=user)
        return Response(
            {'Message': 'Added Account'}, 
            status=status.HTTP_200_OK)
        
    def get(self, request, format=None):
        if not self.request.user.is_authenticated:
            return Response(
            {'Message': 'User Not Does not Exist'}, 
            status=status.HTTP_400_BAD_REQUEST)
        
        accounts = Account.objects.all()
        serializer = AccountSerializer(accounts, many=True)
        return Response(
            serializer.data, 
            status=status.HTTP_200_OK)
