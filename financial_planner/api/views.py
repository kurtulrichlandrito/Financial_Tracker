from django.shortcuts import render
from rest_framework.views import APIView

# Create your views here.

class CreateExpense(APIView):
    def post(self, request, format=None):
        pass

class GetExpense(APIView):
    def get(self, request, format=None):
        pass

class CreateUser(APIView):
    def post(self, request, format=None):
        pass

class LoginUser(APIView):
    def get(self, request, format=None):
        pass

class CreateExpenseCategory(APIView):
    def post(self, request, format=None):
        pass

class getExpenseCategory(APIView):
    def get(self, request, format=None):
        pass

class CreateAsset(APIView):
    def post(self, request, format=None):
        pass

class CreateLiability(APIView):
    def post(self, request, format=None):
        pass