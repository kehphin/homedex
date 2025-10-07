from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from djstripe.models import Product, Price, Customer, Subscription, Session, Plan, PaymentIntent, Charge, Refund
from django.conf import settings
from unittest.mock import patch, MagicMock
from .models import UserCustomer
from .permissions import HasPurchasedProduct, HasAnyActiveSubscription, HasAllActiveSubscriptions
from rest_framework.test import APIRequestFactory
from rest_framework.views import APIView
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone
from datetime import timedelta

class MockView(APIView):
    def get(self, request):
        return None

class PaymentViewTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create test stripe customer
        self.stripe_customer = Customer.objects.create(
            id='cus_test123',
            livemode=False,
            email=self.user.email
        )
        
        # Link customer to user
        self.user_customer = UserCustomer.objects.create(
            user=self.user,
            customer=self.stripe_customer
        )
        
        # Create test product
        self.product = Product.objects.create(
            id='prod_test123',
            name='Test Product',
            active=True,
            livemode=False
        )
        
        self.price = Price.objects.create(
            id='price_test123',
            product=self.product,
            active=True,
            unit_amount=1000,
            currency='usd',
            type='one_time',
            livemode=False
        )

    @patch('stripe.checkout.Session.create')
    def test_create_checkout_session(self, mock_session_create):
        """Test creating a checkout session"""
        mock_session = MagicMock()
        mock_session.id = 'cs_test_123'
        mock_session_create.return_value = mock_session

        url = reverse('create-checkout-session')
        payload = {
            'product_id': self.product.id,
            'success_url': 'http://localhost/success',
            'cancel_url': 'http://localhost/cancel'
        }
        
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['sessionId'], 'cs_test_123')

    def test_create_checkout_session_invalid_product(self):
        """Test creating a checkout session with invalid product"""
        url = reverse('create-checkout-session')
        payload = {
            'product_id': 'invalid_id',
            'success_url': 'http://localhost/success',
            'cancel_url': 'http://localhost/cancel'
        }
        
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

class PaymentHistoryViewTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='test@example.com',
            password='testpass123'
        )
        
        # Create test stripe customer
        self.stripe_customer = Customer.objects.create(
            id='cus_test123',
            livemode=False,
            email=self.user.email
        )
        
        # Link customer to user
        self.user_customer = UserCustomer.objects.create(
            user=self.user,
            customer=self.stripe_customer
        )

    def test_payment_history_unauthorized(self):
        """Test payment history endpoint requires authentication"""
        url = reverse('payment-history')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_payment_history_empty(self):
        """Test payment history with no payments"""
        self.client.force_authenticate(user=self.user)
        url = reverse('payment-history')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data'], [])

class PermissionsTests(APITestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = get_user_model().objects.create_user(
            username='test@example.com',
            password='testpass123'
        )
        
        # Create test stripe customer
        self.stripe_customer = Customer.objects.create(
            id='cus_test123',
            livemode=False,
            email=self.user.email
        )
        
        # Link customer to user
        self.user_customer = UserCustomer.objects.create(
            user=self.user,
            customer=self.stripe_customer
        )
        
        # Create test products
        self.product1 = Product.objects.create(
            id='prod_test123',
            name='Test Product 1',
            active=True,
            livemode=False
        )
        
        self.product2 = Product.objects.create(
            id='prod_test456',
            name='Test Product 2',
            active=True,
            livemode=False
        )

        # Create a Plan for the products
        self.plan1 = Plan.objects.create(
            id='plan_test123',
            product=self.product1,
            amount=1000,
            currency='usd',
            interval='month',
            active=True
        )
        
        self.plan2 = Plan.objects.create(
            id='plan_test456',
            product=self.product2,
            amount=1000,
            currency='usd',
            interval='month',
            active=True
        )

        # Create test session with line items and required payment_method_types
        self.session = Session.objects.create(
            id='cs_test123',
            customer=self.stripe_customer,
            payment_status='paid',
            amount_total=1000,
            payment_method_types=['card'],
            line_items={
                'data': [
                    {
                        'price': {'product': self.product1.id},
                        'quantity': 1
                    }
                ]
            }
        )

    def test_has_purchased_product_permission(self):
        """Test HasPurchasedProduct permission class"""
        request = self.factory.get('/')
        request.user = self.user
        
        view = MockView()
        view.required_product_id = self.product1.id
        permission = HasPurchasedProduct()
        
        # Test with purchased product
        has_permission = permission.has_permission(request, view)
        self.assertTrue(has_permission)
        
        # Test with non-purchased product
        view.required_product_id = self.product2.id
        has_permission = permission.has_permission(request, view)
        self.assertFalse(has_permission)
        
        # Test with unauthenticated user
        request.user = AnonymousUser()
        has_permission = permission.has_permission(request, view)
        self.assertFalse(has_permission)

    def test_has_any_active_subscription_permission(self):
        """Test HasAnyActiveSubscription permission class"""
        request = self.factory.get('/')
        request.user = self.user
        
        view = MockView()
        view.required_subscription_ids = [self.product1.id]
        permission = HasAnyActiveSubscription()
        
        # Test with no active subscription
        has_permission = permission.has_permission(request, view)
        self.assertFalse(has_permission)
        
        # Create active subscription
        subscription = Subscription.objects.create(
            id='sub_test123',
            customer=self.stripe_customer,
            status='active',
            plan=self.plan1,
            current_period_end=timezone.now() + timedelta(days=30),
            start_date=timezone.now(),
            collection_method='charge_automatically',
            proration_behavior='create_prorations',
            current_period_start=timezone.now(),
        )
        
        # Test with active subscription
        has_permission = permission.has_permission(request, view)
        self.assertTrue(has_permission)

    def test_has_all_active_subscriptions_permission(self):
        """Test HasAllActiveSubscriptions permission class"""
        request = self.factory.get('/')
        request.user = self.user
        
        view = MockView()
        view.required_subscription_ids = [self.product1.id, self.product2.id]
        permission = HasAllActiveSubscriptions()
        
        # Test with no subscriptions
        has_permission = permission.has_permission(request, view)
        self.assertFalse(has_permission)
        
        # Create subscription for first product
        subscription1 = Subscription.objects.create(
            id='sub_test123',
            customer=self.stripe_customer,
            status='active',
            plan=self.plan1,
            current_period_end=timezone.now() + timedelta(days=30),
            start_date=timezone.now(),
            collection_method='charge_automatically',
            proration_behavior='create_prorations',
            current_period_start=timezone.now()
        )
        
        # Test with one subscription
        has_permission = permission.has_permission(request, view)
        self.assertFalse(has_permission)
        
        # Create subscription for second product
        subscription2 = Subscription.objects.create(
            id='sub_test456',
            customer=self.stripe_customer,
            status='active',
            plan=self.plan2,
            current_period_end=timezone.now() + timedelta(days=30),
            start_date=timezone.now(),
            collection_method='charge_automatically',
            proration_behavior='create_prorations',
            current_period_start=timezone.now(),
        )
        
        # Test with all required subscriptions
        has_permission = permission.has_permission(request, view)
        self.assertTrue(has_permission)

    def test_permissions_after_subscription_cancellation(self):
        """Test subscription permissions after cancellation"""
        request = self.factory.get('/')
        request.user = self.user
        
        # Create active subscription
        subscription = Subscription.objects.create(
            id='sub_test789',
            customer=self.stripe_customer,
            status='active',
            plan=self.plan1,
            current_period_end=timezone.now() + timedelta(days=30),
            start_date=timezone.now(),
            collection_method='charge_automatically',
            proration_behavior='create_prorations',
            current_period_start=timezone.now(),
        )
        
        # Setup view and permissions
        view = MockView()
        view.required_subscription_ids = [self.product1.id]
        any_subscription_permission = HasAnyActiveSubscription()
        all_subscriptions_permission = HasAllActiveSubscriptions()
        
        # Test permissions with active subscription
        self.assertTrue(any_subscription_permission.has_permission(request, view))
        self.assertTrue(all_subscriptions_permission.has_permission(request, view))
        
        # Cancel subscription but still within period
        subscription.cancel_at_period_end = True
        subscription.save()
        
        # Should still have access during the paid period
        self.assertTrue(any_subscription_permission.has_permission(request, view))
        self.assertTrue(all_subscriptions_permission.has_permission(request, view))
        
        # Set subscription as fully canceled
        subscription.status = 'canceled'
        subscription.ended_at = timezone.now()
        subscription.save()
        
        # Should no longer have access after full cancellation
        self.assertFalse(any_subscription_permission.has_permission(request, view))
        self.assertFalse(all_subscriptions_permission.has_permission(request, view))

    def test_has_purchased_product_permission_with_download(self):
        """Test HasPurchasedProduct permission for file downloads"""
        request = self.factory.get('/')
        request.user = self.user
        
        # Create a new product specifically for this test
        download_product = Product.objects.create(
            id='prod_test_download',
            name='Test Download Product',
            active=True,
            livemode=False
        )
        
        view = MockView()
        view.required_product_id = download_product.id
        permission = HasPurchasedProduct()
        
        # Test with no purchase - should not have permission
        has_permission = permission.has_permission(request, view)
        self.assertFalse(has_permission)
        
        # Create test session with line items for download_product
        session = Session.objects.create(
            id='cs_test_download',
            customer=self.stripe_customer,
            payment_status='paid',
            amount_total=1000,
            payment_method_types=['card'],
            line_items={
                'data': [
                    {
                        'price': {'product': download_product.id},
                        'quantity': 1
                    }
                ]
            }
        )
        
        # Test after purchase - should have permission
        has_permission = permission.has_permission(request, view)
        self.assertTrue(has_permission)
        
        # Create a PaymentIntent and Charge for refund testing
        payment_intent = PaymentIntent.objects.create(
            id='pi_test_refund',
            amount=1000,
            currency='usd',
            customer=self.stripe_customer,
            amount_capturable=1000,
            amount_received=1000,
            status='succeeded',
            payment_method_types=['card'],
        )
        
        charge = Charge.objects.create(
            id='ch_test_refund',
            amount=1000,
            currency='usd',
            customer=self.stripe_customer,
            payment_intent=payment_intent,
            refunded=True,
            amount_refunded=1000
        )
        
        refunds = Refund.objects.create(
            id='rf_test_refund',
            amount=1000,
            currency='usd',
            charge=charge,
            status='succeeded'
        )
        
        # Link the PaymentIntent to the session
        session.payment_intent = payment_intent
        session.save()
        
        # Should not have permission after refund
        has_permission = permission.has_permission(request, view)
        self.assertFalse(has_permission)
        
        # Test with unauthenticated user
        request.user = AnonymousUser()
        has_permission = permission.has_permission(request, view)
        self.assertFalse(has_permission)

