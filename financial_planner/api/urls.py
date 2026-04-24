from django.urls import path
from .views import *

urlpatterns = [
    path('create-expense', CreateExpense.as_view()),
    path('get-expenses', GetExpense.as_view()),
    path('create-expense-category', CreateExpenseCategory.as_view()),
    path('get-expense-category', GetExpenseCategory.as_view()),
    path('signup', CreateUser.as_view()),
    path('login', LoginUser.as_view()),
    path('logout', LogoutUser.as_view()),
    path('create-asset', CreateAsset.as_view()),
    path('create-liability', CreateLiability.as_view()),
    path('check-auth', CheckAuth.as_view()),
]