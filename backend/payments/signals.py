from django.conf import settings
from allauth.account.signals import user_signed_up
from django.dispatch import receiver
import stripe
from djstripe.models import Customer
from django.dispatch import receiver
from djstripe.signals import webhook_post_process
from django.contrib.auth.models import User
from allauth.account.models import EmailAddress
import stripe
from .models import UserCustomer
import logging
from django.db import transaction


logger = logging.getLogger(__name__)


@receiver(user_signed_up)
@transaction.atomic
def create_stripe_customer(request, user, **kwargs):
    """
    Create a stripe customer when a user signs up for the site.
    If a customer already exists with the email, create an association with the user.
    If multiple customers exist with the email, create an association with all.
    """
    logger.info(f"Creating Stripe Customer Association for user {user.email}")

    # Check if customers exist with this email
    existing_customers = Customer.objects.filter(email=user.email, livemode=settings.STRIPE_LIVE_MODE)

    if existing_customers.exists():
        # Get all customers that exist
        for customer in existing_customers:
            # Use get_or_create to avoid potential race conditions
            user_customer, created = UserCustomer.objects.get_or_create(
                user=user,
                customer=customer
            )
            if created:
                logger.info(f"Created UserCustomer association for customer {customer.id}")
            else:
                logger.info(f"UserCustomer association already exists for customer {customer.id}")
    else:
        logger.info("Customer Does Not Exist - Creating one")
        try:
            # If a customer doesn't exist, create one
            stripe_customer = stripe.Customer.create(
                email=user.email,
                name=user.username,
                api_key=settings.STRIPE_TEST_SECRET_KEY if not settings.STRIPE_LIVE_MODE else settings.STRIPE_LIVE_SECRET_KEY
            )
            customer = Customer.sync_from_stripe_data(stripe_customer)
            
            # Create association with the user
            UserCustomer.objects.create(
                user=user,
                customer=customer
            )
            logger.info(f"Created new Stripe customer and UserCustomer association for {user.email}")
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error occurred: {str(e)}")
            # You might want to add some error handling here, such as notifying the user or admins
        except Exception as e:
            logger.error(f"Unexpected error occurred: {str(e)}")

# In the circumstance that someone purchased using an account that was already created,
# we need to create a UserCustomer association for the user.
@receiver(webhook_post_process)
def webook_post_process(sender, **kwargs):
    event = kwargs.get('event')

    if event and event.type == 'customer.created':
        data = event.data
        customer_id = data['object']['id']
        customer = Customer.objects.get(id=customer_id, livemode=settings.STRIPE_LIVE_MODE)
        user = User.objects.filter(email=customer.email).first()
        
        if user and not UserCustomer.objects.filter(user=user, customer__livemode=settings.STRIPE_LIVE_MODE).exists():
            UserCustomer.objects.create(
                user=user,
                customer=customer
            )
