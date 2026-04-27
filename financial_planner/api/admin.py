from django.contrib import admin
from .models import  *
# Register your models here.
admin.site.register(Expense)
admin.site.register(ExpenseCategory)
admin.site.register(Income)
admin.site.register(IncomeCategory)
admin.site.register(Asset)
admin.site.register(Liability)
admin.site.register(CategoryRule)