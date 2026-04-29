from django.urls import path
from .views import *

urlpatterns = [

    path('signup/', CreateUser.as_view()),
    path('login/', LoginUser.as_view()),
    path('logout/', LogoutUser.as_view()),
    path('check-auth/', CheckAuth.as_view()),
    path('transactions/', Transactions.as_view()),
    # path('expense/', Expenses.as_view()),
    # path('income/', Incomes.as_view()),
    # path('expense-category/', ExpenseCategories.as_view()),
    # path('income-category/', IncomeCategories.as_view()),
    path('categories/', Categories.as_view()),
    path('asset/', Assets.as_view()),
    path('liability/', Liabilities.as_view()),
    path('upload-files/', TransactionImport.as_view()),
    # path('upload-files/', ImportExpenses.as_view()),
    path('get-grouped-expenses/', GetGroupedExpenses.as_view()),
    path('get-grouped-incomes/', GetGroupedIncomes.as_view()),
    path('account/', Accounts.as_view()),
    path('net-worth/', NetWorth.as_view()),
    path('search', Search.as_view()),
    path('categorize-expenses/', BatchCategorizeExpense.as_view()),
    path('categorize-incomes/', BatchCategorizeIncome.as_view()),
]