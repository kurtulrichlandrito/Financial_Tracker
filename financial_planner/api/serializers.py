from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from .models import *

class UserSerializer(ModelSerializer):
    first_name = serializers.CharField(required=True, error_messages={
    'blank': 'First name is required.',
    'required': 'First name is required.',
})
    last_name = serializers.CharField(required=True, error_messages={
    'blank': 'Last name is required.',
    'required': 'Last name is required.',
})
    email = serializers.EmailField(required=True, error_messages={
    'blank': 'Email is required.',
    'required': 'Email is required.',
})
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
        fields = ('user', 'id', 'expense_category') 
        read_only_fields = ('user',)

class ExpenseSerializer(ModelSerializer):
    expense_category = serializers.CharField(
        source='expense_category.expense_category', 
        read_only=True
    )
    account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(),
        source='account'
    )
    class Meta:
        model = Expense
        fields = ('user', 
                  'id',
                  'expense_date', 
                  'expense_category', 
                  'expense_amount', 
                  'expense_notes',
                  'account_id')
        read_only_fields = ('user',)

class IncomeCategorySerializer(ModelSerializer):
    class Meta:
        model = IncomeCategory
        fields = ('user', 'id', 'income_category')
        read_only_fields = ('user',) 

class IncomeSerializer(ModelSerializer):
    income_category = serializers.CharField(
        source='income_category.income_category', 
        read_only=True
    )
    account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(),
        source='account'
    )
    class Meta:
        model = Income
        fields = ('user', 
                  'id',
                  'income_date', 
                  'income_category', 
                  'income_amount',
                  'income_notes',
                  'account_id')
        read_only_fields = ('user',)

class AssetSerializer(ModelSerializer):
    class Meta:
        model = Asset
        fields = ('user', 'id', 'asset_name', 'asset_amount')
        read_only_fields = ('user',)

class LiabilitySerializer(ModelSerializer):
    class Meta:
        model = Liability
        fields = ('user', 'id', 'liability_name', 'liability_amount')
        read_only_fields = ('user',)

class AccountSerializer(ModelSerializer):
    
    class Meta:
        model = Account
        fields = ('user', 
                  'id',
                   'account_type',
                   'date_added',
                   'balance',
                   'account_nickname',
                   'date_updated')
        read_only_fields = ('user', 'date_added')

class NetWorthSerializer(serializers.Serializer):
    total_assets = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_liabilities = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_worth = serializers.DecimalField(max_digits=15, decimal_places=2)

class TransactionSerializer(ModelSerializer):
    transaction_category = serializers.PrimaryKeyRelatedField(
            queryset=Category.objects.all(),
            required=False,
            allow_null=True
        )
    account_id = serializers.PrimaryKeyRelatedField(
        queryset=Account.objects.all(),
        source='account'
    )
    transaction_category_name = serializers.CharField(
        source='transaction_category.transaction_category',
        read_only=True
    )

    class Meta:
        model = Transaction
        fields = ('user',
                  'id',
                  'transaction_date',
                  'transaction_category',
                  'transaction_category_name',
                  'transaction_amount',
                  'transaction_notes',
                  'account_id',
                  'transaction_type')
        read_only_fields = ('user',)

class CategorySerializer(ModelSerializer):
    
    class Meta:
        model = Category
        fields = ('user', 
                  'id', 
                  'transaction_category',
                  'transaction_type') 
        read_only_fields = ('user',)

