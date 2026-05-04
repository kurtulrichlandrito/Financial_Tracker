from django.urls import path
from .views import *

urlpatterns = [

    path('signup/', CreateUser.as_view()),
    path('login/', LoginUser.as_view()),
    path('logout/', LogoutUser.as_view()),
    path('check-auth/', CheckAuth.as_view()),
    path('transactions/', Transactions.as_view()),
    path('categories/', Categories.as_view()),
    path('asset/', Assets.as_view()),
    path('liability/', Liabilities.as_view()),
    path('upload-files/', TransactionImport.as_view()),
    path('get-grouped-transactions/', GetGroupedTransactions.as_view()),
    path('account/', Accounts.as_view()),
    path('net-worth/', NetWorth.as_view()),
    path('search', Search.as_view()),
    path('categorize-transactions/', BatchCategorizeTransactions.as_view()),
    path('reports/', Reports.as_view()),
    path('create-user-token/', PlaidCreateLinkToken.as_view()),
    path('exchange-public-token/', PlaidExchangePublicTokenForAccessToken.as_view()),
    
]