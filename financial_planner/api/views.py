from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import *
from django.contrib.auth import authenticate, login, logout
from .utils.data_extraction import data_extractor

# Create your views here.

class CreateExpense(APIView):
    serializer_class = ExpenseSerializer
    def post(self, request, format=None):
        serializer = ExpenseSerializer(data=request.data)

        if serializer.is_valid():
            if self.request.user.is_authenticated:
                serializer.save()
                return Response({'Message': 'Added Expense'}, status=status.HTTP_200_OK)
            return Response({'Message': 'User Not Does not Exist'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'Message': 'Invalid Request'}, status=status.HTTP_400_BAD_REQUEST)

class GetExpense(APIView):
    def get(self, request, format=None):
        user = self.request.user
        if user.is_authenticated:
            expenses = Expense.objects.all().filter(user=user)
            serializer = ExpenseSerializer(expenses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'Message': 'User Not Does not Exist'}, status=status.HTTP_400_BAD_REQUEST)

class CreateUser(APIView):
    serializer_class = UserSerializer
    def post(self, request, format=None):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            if not User.objects.filter(email=request.data.get('email')).exists():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response({'Message': 'Email already Exists'},status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginUser(APIView):
    serializer_class = UserSerializer
    def post(self, request, format=None):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({'Message': 'Login Successful'}, status=status.HTTP_200_OK)
        return Response({'Message': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)
    
class CreateExpenseCategory(APIView):
    serializer_class = ExpenseCategorySerializer
    def post(self, request, format=None):
        serializer = ExpenseCategorySerializer(data=request.data)
        
        if serializer.is_valid():
            user = self.request.user
            if user.is_authenticated:
                expense_category = request.data.get('expense_category')
                exists = ExpenseCategory.objects.filter( user=request.user, expense_category=expense_category).exists()
                if not exists:
                    serializer.save(user=self.request.user)
                    return Response({'Message': 'Added Expense Category'}, status=status.HTTP_200_OK)
                return Response({'Message': 'Category Already Exists'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'Message': 'User Not Does not Exist'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({'Message': 'Invalid Request'}, status=status.HTTP_400_BAD_REQUEST)
            

class GetExpenseCategory(APIView):
    def get(self, request, format=None):
        if self.request.user.is_authenticated:
            categories = ExpenseCategory.objects.all()
            serializer = ExpenseCategorySerializer(categories, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'Message': 'User Not Does not Exist'}, status=status.HTTP_400_BAD_REQUEST)


class CreateAsset(APIView):
    serializer_class = AssetSerializer
    def post(self, request, format=None):
        serializer = AssetSerializer(data=request.data)
        
        if serializer.is_valid():
            user = self.request.user
            if user.is_authenticated:
                serializer.save()
                return Response({'Message': 'Added Asset'}, status=status.HTTP_200_OK)
            return Response({'Message': 'User Not Does not Exist'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'Message': 'Invalid Request'}, status=status.HTTP_400_BAD_REQUEST)

class CreateLiability(APIView):
    serializer_class = LiabilitySerializer
    def post(self, request, format=None):
        serializer = LiabilitySerializer(data=request.data)
        
        if serializer.is_valid():
            user = self.request.user
            if user.is_authenticated:
                serializer.save()
                return Response({'Message': 'Added Liability'}, status=status.HTTP_200_OK)
            return Response({'Message': 'User Not Does not Exist'}, status=status.HTTP_401_UNAUTHORIZED)
        
    
class LogoutUser(APIView):
    def post(self, request, format=None):
        logout(request)
        return Response({'Message': 'Logout Successful'}, status=status.HTTP_200_OK)

class CheckAuth(APIView):
    def get(self, request, format=None):
        if request.user.is_authenticated:
            return Response({'isAuthenticated': True})
        return Response({'isAuthenticated': False})
    
class ImportExpenses(APIView):

    def post(self, request, format=None):
        user = self.request.user
        if user.is_authenticated:
            file = self.request.FILES.get('file')
            data = data_extractor(file)
            if (data):
                all_valid = True
                for transaction in data:
                    serializer = ExpenseSerializer(data=transaction)
                    if serializer.is_valid():
                        serializer.save(user=user)
                    else:
                        all_valid = False
                if all_valid:
                    return Response({'Message': 'All Transactions Imported Successfully'}, status=status.HTTP_200_OK)
                return Response({'Message': 'Some transactions have invalid fields'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'Message': 'File uploaded is not valid'}, status=status.HTTP_400_BAD_REQUEST)    
        return Response({'Message': 'User Not Does not Exist'}, status=status.HTTP_401_UNAUTHORIZED)