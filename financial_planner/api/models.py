from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class ExpenseCategory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    expense_date = models.DateField()
    expense_category = models.ForeignKey(ExpenseCategory, null=True, on_delete=models.SET_NULL)
    expense_amount = models.DecimalField(max_digits=10, decimal_places=2)
    expense_notes = models.TextField(null=True, blank=True)

class IncomeCategory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    income_name = models.CharField(max_length=100)

class Income(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    income_category = models.ForeignKey(IncomeCategory, null=True, on_delete=models.SET_NULL)
    income_amount = models.DecimalField(max_digits=10, decimal_places=2)


class Asset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    asset_name = models.CharField(max_length=100, null=True)
    asset_amount = models.DecimalField(max_digits=10, decimal_places=2)


class Liability(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    liability_name = models.CharField(max_length=100)
    liability_amount = models.DecimalField(max_digits=10, decimal_places=2)
