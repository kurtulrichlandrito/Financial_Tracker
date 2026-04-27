from django.urls import path
from .views import *

urlpatterns = [

    path('signup/', CreateUser.as_view()),
    path('login/', LoginUser.as_view()),
    path('logout/', LogoutUser.as_view()),
    path('check-auth/', CheckAuth.as_view()),
    path('expense/', Expenses.as_view()),
    path('expense-category/', ExpenseCategories.as_view()),
    path('asset/', Assets.as_view()),
    path('liability/', Liabilities.as_view()),
    path('upload-files/', ImportExpenses.as_view()),
    path('get-grouped-expenses/', GetGroupedExpenses.as_view()),
]