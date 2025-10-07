from rest_framework import status, views, permissions
from rest_framework.response import Response
import stripe
from django.conf import settings
from djstripe.models import Product, Price, Customer, Charge, Subscription
from .models import UserCustomer
import json
import logging

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_TEST_SECRET_KEY

class CreateCheckoutSessionView(views.APIView):
    permission_classes = []

    def post(self, request):
        try:
            data = request.data
            product = Product.objects.get(id=data['product_id'])
            
            price = Price.objects.get(product=product)
            customers = get_or_create_customers_for_user(request.user) if request.user.is_authenticated else None
            promo_code = data.get('promo_code')

            mode = 'payment'
            if price.recurring:
                mode = 'subscription'
                
            data = {
                'line_items': [
                    {
                        'price': price.id,
                        'quantity': 1,
                    },
                ],
                'mode': mode,
                'success_url': f"{data['success_url']}?session_id={{CHECKOUT_SESSION_ID}}",
                'cancel_url': data['cancel_url'],
                'discounts': [{
                    'coupon': promo_code
                }] if promo_code else None,
            }
            
            if customers and len(customers) > 0:
                data['customer'] = customers[0].id
            elif not price.recurring:
                data['customer_creation'] = 'always'
            
            session = stripe.checkout.Session.create(
                **data
            )
            return Response({'sessionId': session.id})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_or_create_customers_for_user(user):
    """
    Get existing customers for the user or create a new one if none exist.
    Returns a tuple: (customer_to_use, all_customers)
    """
    user_customers = UserCustomer.objects.filter(user=user, customer__livemode=settings.STRIPE_LIVE_MODE)
    
    if user_customers.exists():
        all_customers = [uc.customer for uc in user_customers if uc.customer.deleted == False and uc.customer.livemode == settings.STRIPE_LIVE_MODE]
        # For now, we'll use the most recently created customer
        return all_customers
    else:
        # If no customer exists, create a new one
        try:
            stripe_customer = stripe.Customer.create(
                email=user.email,
                name=user.username,
                api_key=settings.STRIPE_TEST_SECRET_KEY if not settings.STRIPE_LIVE_MODE else settings.STRIPE_LIVE_SECRET_KEY
            )
            customer = Customer.sync_from_stripe_data(stripe_customer)
            
            UserCustomer.objects.create(
                user=user,
                customer=customer
            )
            return [customer]
        except stripe.error.StripeError as e:
            # Handle Stripe errors (e.g., network issues, authentication problems)
            print(f"Stripe error: {str(e)}")
            return []
        except Exception as e:
            # Handle any other unexpected errors
            print(f"Unexpected error: {str(e)}")
            return []

class CancelSubscriptionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            subscription_id = request.data.get('subscriptionId')
            if not subscription_id:
                return Response({'error': 'Subscription ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            user = request.user
            for user_customer in UserCustomer.objects.filter(user=user, customer__livemode=settings.STRIPE_LIVE_MODE):
                customer = user_customer.customer
                subscription = Subscription.objects.filter(customer=customer, id=subscription_id).first()
                if subscription is None:
                    continue
                logger.info(f"Canceling subscription {subscription.id}")
                stripe_subscription = stripe.Subscription.retrieve(subscription.id)
                stripe_subscription.cancel_at_period_end = True
                stripe_subscription.save()
                subscription.cancel_at_period_end = True
                subscription.status = stripe_subscription.status
                subscription.save()
                        
                return Response({'status': 'Subscriptions cancelled'})
        except UserCustomer.DoesNotExist:
            return Response({'error': 'User does not have a subscription'}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ReactivateSubscriptionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            subscription_id = request.data.get('subscriptionId')
            if not subscription_id:
                return Response({'error': 'Subscription ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            user = request.user
            for user_customer in UserCustomer.objects.filter(user=user, customer__livemode=settings.STRIPE_LIVE_MODE):
                customer = user_customer.customer
                subscription = Subscription.objects.filter(customer=customer, id=subscription_id).first()
                if subscription is None:
                    continue
                logger.info(f"Reactivating subscription {subscription.id}")
                stripe_subscription = stripe.Subscription.retrieve(subscription.id)
                stripe_subscription.cancel_at_period_end = False
                stripe_subscription.save()
                subscription.cancel_at_period_end = False
                subscription.status = stripe_subscription.status
                subscription.save()
                        
                return Response({'status': 'Subscriptions reactivated'})
        except UserCustomer.DoesNotExist:
            return Response({'error': 'User does not have a subscription'}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetCheckoutSessionView(views.APIView):
    def get(self, request, session_id):
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            customer_email = session.customer_details.email if session.customer_details else None
            
            return Response({'session': session, 'customer_email': customer_email})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PaymentHistoryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            customers = get_customers_for_user(request.user)
            charges = Charge.objects.filter(customer__in=customers).order_by('-created')
            payments = [{
                'id': charge.id,
                'amount': float(charge.amount),
                'status': charge.status,
                'created': charge.invoice.created if charge.invoice else charge.created,
                'refunded': charge.refunded,
                'description': charge.description or 'No description provided',
            } for charge in charges]
            return Response({'data': payments})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

def get_customers_for_user(user):
    usercustomers = UserCustomer.objects.filter(user=user, customer__livemode=settings.STRIPE_LIVE_MODE)
    if len(usercustomers) == 0:
        raise Exception('User does not have a customer association')    
    customers = [uc.customer for uc in usercustomers if uc.customer.deleted == False and uc.customer.livemode == settings.STRIPE_LIVE_MODE]
    if len(customers) == 0:
        raise Exception('Customers not found')
    return customers

class ActiveSubscriptionsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            customers = get_customers_for_user(request.user)
            subscriptions = Subscription.objects.filter(customer__in=customers)
            data = [{
                'id': sub.id,
                'plan': sub.plan.product.name,
                'price': float(sub.plan.amount),
                'interval': sub.plan.interval,
                'periodEnd': sub.current_period_end,
                'canceledAt': sub.canceled_at,
                'cancelAt': sub.cancel_at,
                'endedAt': sub.ended_at,
                'cancelAtPeriodEnd': sub.cancel_at_period_end,
                'status': sub.status
            } for sub in subscriptions]
            return Response({'data': data})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
