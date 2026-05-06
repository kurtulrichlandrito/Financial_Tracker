import json
from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Account, Asset, Category, Liability, Transaction


class UserDataIsolationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='owner',
            password='password123'
        )
        self.other_user = User.objects.create_user(
            username='other',
            password='password123'
        )
        self.account = Account.objects.create(
            user=self.user,
            account_nickname='Checking',
            account_type='checking',
            balance=Decimal('100.00')
        )
        self.other_account = Account.objects.create(
            user=self.other_user,
            account_nickname='Other Checking',
            account_type='checking',
            balance=Decimal('200.00')
        )
        self.category = Category.objects.create(
            user=self.user,
            transaction_category='Groceries',
            transaction_type='expense'
        )
        self.other_category = Category.objects.create(
            user=self.other_user,
            transaction_category='Other Groceries',
            transaction_type='expense'
        )
        self.transaction = Transaction.objects.create(
            user=self.user,
            account=self.account,
            transaction_date='2026-04-01',
            transaction_amount=Decimal('10.00'),
            transaction_notes='Market',
            transaction_type='expense'
        )
        self.other_transaction = Transaction.objects.create(
            user=self.other_user,
            account=self.other_account,
            transaction_date='2026-04-02',
            transaction_amount=Decimal('20.00'),
            transaction_notes='Other Market',
            transaction_type='expense'
        )

    def login(self):
        self.client.force_login(self.user)

    def test_assets_are_scoped_to_authenticated_user(self):
        own_asset = Asset.objects.create(
            user=self.user,
            asset_name='Savings',
            asset_amount=Decimal('100.00')
        )
        Asset.objects.create(
            user=self.other_user,
            asset_name='Other Savings',
            asset_amount=Decimal('200.00')
        )
        self.login()

        response = self.client.get('/api/asset/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['id'] for item in response.data], [own_asset.id])

    def test_liabilities_are_scoped_to_authenticated_user(self):
        own_liability = Liability.objects.create(
            user=self.user,
            liability_name='Card',
            liability_amount=Decimal('100.00')
        )
        Liability.objects.create(
            user=self.other_user,
            liability_name='Other Card',
            liability_amount=Decimal('200.00')
        )
        self.login()

        response = self.client.get('/api/liability/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['id'] for item in response.data], [own_liability.id])

    def test_transaction_create_rejects_another_users_account(self):
        self.login()

        response = self.client.post('/api/transactions/', {
            'account_id': self.other_account.id,
            'transaction_date': '2026-04-03',
            'transaction_amount': '12.00',
            'transaction_notes': 'Should not save',
            'transaction_type': 'expense',
        }, format='json')

        self.assertEqual(response.status_code, 404)
        self.assertFalse(Transaction.objects.filter(
            user=self.user,
            account=self.other_account
        ).exists())

    def test_transaction_create_allows_manual_transaction_without_plaid_id(self):
        self.login()

        response = self.client.post('/api/transactions/', {
            'account_id': self.account.id,
            'transaction_date': '2026-04-03',
            'transaction_amount': '12.00',
            'transaction_notes': 'Manual entry',
            'transaction_type': 'expense',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        transaction = Transaction.objects.get(
            user=self.user,
            transaction_notes='Manual entry'
        )
        self.assertIsNone(transaction.plaid_transaction_id)

    def test_transaction_update_rejects_another_users_category(self):
        self.login()

        response = self.client.patch(
            f'/api/transactions/?id={self.transaction.id}',
            {'transaction_category': self.other_category.id},
            format='json'
        )

        self.assertEqual(response.status_code, 404)
        self.transaction.refresh_from_db()
        self.assertIsNone(self.transaction.transaction_category)

    def test_batch_categorize_only_updates_authenticated_users_transactions(self):
        self.login()

        response = self.client.patch('/api/categorize-transactions/', [{
            'category': self.category.transaction_category,
            'transaction_Ids': [self.transaction.id, self.other_transaction.id],
        }], format='json')

        self.assertEqual(response.status_code, 200)
        self.transaction.refresh_from_db()
        self.other_transaction.refresh_from_db()
        self.assertEqual(self.transaction.transaction_category, self.category)
        self.assertIsNone(self.other_transaction.transaction_category)

    def test_upload_rejects_another_users_account(self):
        self.login()
        account = {
            'id': self.other_account.id,
            'account_type': self.other_account.account_type,
            'account_nickname': self.other_account.account_nickname,
            'balance': str(self.other_account.balance),
        }

        response = self.client.post('/api/upload-files/', {
            'account': json.dumps(account),
        }, format='multipart')

        self.assertEqual(response.status_code, 404)
