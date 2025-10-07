import logging
from rest_framework.permissions import BasePermission
from djstripe.models import Session, Subscription
from django.db.models import Q, OuterRef, Subquery
from .views import get_customers_for_user

logger = logging.getLogger(__name__)

class HasPurchasedAnyProduct(BasePermission):
    def has_permission(self, request, view):
        required_product_ids = getattr(view, 'required_product_ids', [])

        if not request.user.is_authenticated or not required_product_ids:
            logger.info("User is not authenticated or required_product_ids is not set")
            return False

        customers = []
        try:
            customers = get_customers_for_user(request.user)
        except Exception:
            logger.info("UserCustomer or Customer does not exist")
            return False

        # Subquery to check for full refunds
        full_refund_subquery = Session.objects.filter(
            id=OuterRef('id'),
            payment_intent__charges__refunds__status='succeeded',
            payment_intent__charges__refunds__amount=OuterRef('amount_total')
        )

        # Filter sessions to only include paid ones and exclude fully refunded ones
        sessions = Session.objects.filter(
            customer__in=customers, 
            payment_status='paid'
        ).exclude(
            id__in=Subquery(full_refund_subquery.values('id'))
        )
        
        for session in sessions:
            line_items = session.line_items.get('data', [])
            logger.info(item.get('price', {}).get('product') for item in line_items)
            if any(
                item.get('price', {}).get('product') in required_product_ids
                for item in line_items
            ):
                logger.info(f"User has purchased one of the required products: {required_product_ids}")
                return True

        logger.info(f"User has not purchased any of the required products: {required_product_ids}")
        return False
    
class HasPurchasedProduct(BasePermission):
    def has_permission(self, request, view):
        required_product_id = getattr(view, 'required_product_id', None)

        if not request.user.is_authenticated or not required_product_id:
            logger.info("User is not authenticated or required_product_id is not set")
            return False

        customers = []
        try:
            customers = get_customers_for_user(request.user)
        except Exception:
            logger.info("UserCustomer or Customer does not exist")
            return False

        # Subquery to check for full refunds
        full_refund_subquery = Session.objects.filter(
            id=OuterRef('id'),
            payment_intent__charges__refunds__status='succeeded',
            payment_intent__charges__refunds__amount=OuterRef('amount_total')
        )

        # Filter sessions to only include paid ones and exclude fully refunded ones
        sessions = Session.objects.filter(
            customer__in=customers, 
            payment_status='paid'
        ).exclude(
            id__in=Subquery(full_refund_subquery.values('id'))
        )

        for session in sessions:
            line_items = session.line_items.get('data', [])
            if any(
                item.get('price', {}).get('product') == required_product_id
                for item in line_items
            ):
                logger.info(f"User has purchased the required product: {required_product_id}")
                return True

        logger.info(f"User has not purchased the required product: {required_product_id}")
        return False
        
class HasAnyActiveSubscription(BasePermission):
    def has_permission(self, request, view):
        required_subscription_ids = getattr(view, 'required_subscription_ids', [])
        logger.info(f"required_subscription_ids: {required_subscription_ids}")
        if not request.user.is_authenticated or not required_subscription_ids:
            return False
        customers = []
        try:
            customers = get_customers_for_user(request.user)
        except Exception:
            logger.info("UserCustomer or Customer does not exist")
            return False

        # Check if the user has an active subscription
        return Subscription.objects.filter(
            customer__in=customers,
            status="active",
            plan__product__in=required_subscription_ids
        ).exists()
        
class HasAllActiveSubscriptions(BasePermission):
    def has_permission(self, request, view):
        required_subscription_ids = getattr(view, 'required_subscription_ids', [])
        
        if not request.user.is_authenticated or not required_subscription_ids:
            return False
        customers = []
        try:
            customers = get_customers_for_user(request.user)
        except Exception:
            logger.info("UserCustomer or Customer does not exist")
            return False
        
        # Check if the user has all required active subscriptions
        return Subscription.objects.filter(
            customer__in=customers,
            status="active",
            plan__product__in=required_subscription_ids
        ).count() == len(required_subscription_ids)
