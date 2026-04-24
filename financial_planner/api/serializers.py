from rest_framework.serializers import ModelSerializer
from .models import *

class UserSerializer(ModelSerializer):
    class Meta: 
        model = User
        fields = ('first_name',
                   'last_name', 
                   'email', 
                   'username', 
                   'password', )

    def create(self, validated_data):
        user = User.objects.create_user(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
        )
        return user

class ExpenseCategorySerializer(ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ('user', 'expense_category') 
        read_only_fields = ('user',)

class ExpenseSerializer(ModelSerializer):
    class Meta:
        model = Expense
        fields = ('user', 
                  'expense_date', 
                  'expense_category', 
                  'expense_amount', 
                  'expense_notes')
        read_only_fields = ('user',)

class IncomeCategorySerializer(ModelSerializer):
    class Meta:
        model = Expense
        fields = ('user', 'income_name')
        read_only_fields = ('user',) 

class IncomeSerializer(ModelSerializer):
    class Meta:
        model = Expense
        fields = ('user', 'income_category', 'income_amount')
        read_only_fields = ('user',)

class AssetSerializer(ModelSerializer):
    class Meta:
        model = Asset
        fields = ('user', 'asset_name', 'asset_amount')
        read_only_fields = ('user',)

class LiabilitySerializer(ModelSerializer):
    class Meta:
        model = Liability
        fields = ('user', 'liability_name', 'liability_amount')
        read_only_fields = ('user',)
