from ..models import CategoryRule

def get_category(user, expense_notes):
    rule = CategoryRule.objects.filter(
        user=user,
        keyword__icontains = expense_notes
    )
    if rule:
        return rule.category
    return None