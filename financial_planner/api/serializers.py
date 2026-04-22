from rest_framework.serializers import ModelSerializer
from .models import *

class UserSerializer(ModelSerializer):
    class Meta: 
        model = User
        fields = ('username', 'password')

class ExpenseCategorySerializer(ModelSerializer):
    class Meta:
        model = Expense
        fields = ('user', 'name') 

class ExpenseSerializer(ModelSerializer):
    class Meta:
        model = Expense
        fields = ('user', 
                  'expense_date', 
                  'expense_category', 
                  'expense_amount', 
                  'expense_notes')

class IncomeCategorySerializer(ModelSerializer):
    class Meta:
        model = Expense
        fields = ('user', 'income_name') 

class IncomeSerializer(ModelSerializer):
    class Meta:
        model = Expense
        fields = ('user', 'income_category', 'income_amount')

class AssetSerializer(ModelSerializer):
    class Meta:
        model = Asset
        fields = ('user', 'asset_name', 'asset_amount')

class LiabilitySerializer(ModelSerializer):
    class Meta:
        model = Liability
        fields = ('user', 'liability_name', 'liability_amount')
