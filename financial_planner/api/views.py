from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import *
from django.contrib.auth import authenticate, login


# Create your views here.

class CreateExpense(APIView):
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
        if self.request.user.is_authenticated:
            expenses = Expense.objects.all()
            serializer = Expense(expenses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'Message': 'User Not Does not Exist'}, status=status.HTTP_400_BAD_REQUEST)

class CreateUser(APIView):
    def post(self, request, format=None):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginUser(APIView):
    def post(self, request, format=None):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({'Message': 'Login Successful'}, status=status.HTTP_200_OK)
        return Response({'Message': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)
    
class CreateExpenseCategory(APIView):
    def post(self, request, format=None):
        serializer = ExpenseCategorySerializer(data=request.data)
        
        if serializer.is_valid():
            user = self.request.user
            if user.is_authenticated:
                serializer.save()
                return Response({'Message': 'Added Expense Category'}, status=status.HTTP_200_OK)
            return Response({'Message': 'User Not Does not Exist'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'Message': 'Invalid Request'}, status=status.HTTP_400_BAD_REQUEST)
            

class getExpenseCategory(APIView):
    def get(self, request, format=None):
        if self.request.user.is_authenticated:
            categories = ExpenseCategory.objects.all()
            serializer = ExpenseCategorySerializer(categories, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'Message': 'User Not Does not Exist'}, status=status.HTTP_400_BAD_REQUEST)


class CreateAsset(APIView):
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
    def post(self, request, format=None):
        serializer = LiabilitySerializer(data=request.data)
        
        if serializer.is_valid():
            user = self.request.user
            if user.is_authenticated:
                serializer.save()
                return Response({'Message': 'Added Liability'}, status=status.HTTP_200_OK)
            return Response({'Message': 'User Not Does not Exist'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'Message': 'Invalid Request'}, status=status.HTTP_400_BAD_REQUEST)