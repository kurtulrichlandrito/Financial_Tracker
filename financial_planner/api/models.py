from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.
class ExpenseCategory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    expense_category = models.CharField(max_length=100)

    def __str__(self):
        return self.expense_category

class Account(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    account_nickname = models.CharField(max_length=100)
    account_type = models.CharField(max_length=100)
    date_added = models.DateField(default=timezone.now)
    balance = models.DecimalField(max_digits=10, decimal_places=2)
    date_updated = models.DateField(null=True)

    def __str__(self):
        return (f"{self.account_type} | {self.account_nickname} | "
        + f"{self.balance} | {self.date_added}")

class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    expense_date = models.DateField()
    expense_category = models.ForeignKey(ExpenseCategory, null=True, on_delete=models.SET_NULL)
    expense_amount = models.DecimalField(max_digits=10, decimal_places=2)
    expense_notes = models.TextField(null=True, blank=True)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.expense_amount} - {self.expense_date} - {self.expense_notes}"

class IncomeCategory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    income_category = models.CharField(max_length=100)
    def __str__(self):
        return self.income_category

class Income(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    income_date = models.DateField()
    income_category = models.ForeignKey(IncomeCategory, null=True, on_delete=models.SET_NULL)
    income_amount = models.DecimalField(max_digits=10, decimal_places=2)
    income_notes= models.TextField(null=True, blank=True)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.income_amount} - {self.income_date} - {self.income_notes}"


class Asset(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    asset_name = models.CharField(max_length=100, null=True)
    asset_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    @property
    def computed_amount(self):
        if self.account is not None:
            return self.account.balance

        return self.asset_amount
    def __str__(self):
        return f"{self.asset_name} | {self.asset_amount }"

            


class Liability(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    liability_name = models.CharField(max_length=100)
    liability_amount = models.DecimalField(max_digits=10, decimal_places=2)

class ExpenseCategoryRule(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    keyword = models.CharField(max_length=255)
    category = models.ForeignKey(ExpenseCategory, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.category} - {self.keyword}"

class IncomeCategoryRule(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    keyword = models.CharField(max_length=255)
    category = models.ForeignKey(IncomeCategory, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.category} - {self.keyword}"

class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    transaction_category = models.CharField(max_length=100)
    transaction_type = models.CharField(max_length=100)
    def __str__(self):
        return f"{self.transaction_category} | {self.transaction_type}"
    
class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    transaction_date = models.DateField()
    transaction_category = models.ForeignKey(Category, null=True, on_delete=models.SET_NULL)
    transaction_amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_notes = models.TextField(null=True, blank=True)
    transaction_type = models.CharField(max_length=100)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)

    def __str__(self):
        return (f"{self.transaction_date} | {self.transaction_amount}" +
                f"| {self.transaction_type} | {self.transaction_category}")