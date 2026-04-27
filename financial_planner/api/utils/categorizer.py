from ..models import IncomeCategoryRule, ExpenseCategoryRule, Income, Expense
from ..serializers import IncomeSerializer, ExpenseSerializer

# I dont remember where I used this
# def get_category(user, expense_notes):
#     rule = CategoryRule.objects.filter(
#         user=user,
#         keyword__icontains = expense_notes
#     )
#     if rule:
#         return rule.category
#     return None

def get_model_and_serializer(transaction):
    if any('income' in key for key in transaction.keys()):
        return Income, IncomeSerializer
    return Expense, ExpenseSerializer