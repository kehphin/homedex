from django.conf import settings
from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import FileResponse, JsonResponse

from payments.permissions import HasPurchasedProduct, HasAnyActiveSubscription, HasAllActiveSubscriptions
from rest_framework import permissions
import os

# CHANGE: These are the product IDs and subscription IDs that the user must have purchased to access the views
# You can find these IDs in the Stripe Dashboard
# These views are samples and are for demonstration purposes only
# They are illustrating how to use the permissions classes provided
PRODUCT_IDS = {
    'protected_file': 'prod_123', # Replace with your product IDs
    'protected_data_any': ['prod_123', 'prod_456'], # Replace with your reccurring product IDs
    'protected_data_all': ['prod_123', 'prod_456'], # Replace with your reccurring product IDs
}

class DownloadProtectedFile(APIView):
    permission_classes = [permissions.IsAuthenticated, HasPurchasedProduct]
    # CHANGE: This is the product ID that the user must have purchased to access this view
    required_product_id = PRODUCT_IDS['protected_file'] # This view will check if the user has purchased this product

    def get(self, request, *args, **kwargs):
        file_path = os.path.join(settings.MEDIA_ROOT, 'protected_file.txt')
        if os.path.exists(file_path):
            response = FileResponse(open(file_path, 'rb'), content_type='application/txt')
            response['Content-Disposition'] = 'attachment; filename=protected_file.txt'
            return response
        else:
            return Response({'error': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)
        
class GetProtectedDataSubscriptionsAny(APIView):
    permission_classes = [permissions.IsAuthenticated, HasAnyActiveSubscription]
    # CHANGE: These are the subscription IDs that the user must have to access this view
    required_subscription_ids = PRODUCT_IDS['protected_data_any']  # This view will check if the user has any of these subscriptions

    def get(self, request):
        data = {
            'message': 'SECRET MESSAGE :) - This is protected data that requires at least one of the following active subscriptions.',
        }
        
        return JsonResponse(data)
    
class GetProtectedDataSubscriptionsAll(APIView):
    permission_classes = [permissions.IsAuthenticated, HasAllActiveSubscriptions]
    # CHANGE: These are the subscription IDs that the user must have to access this view
    required_subscription_ids = PRODUCT_IDS['protected_data_all'] # This view will check if the user has ALL of these subscriptions

    def get(self, request):
        data = {
            'message': 'SECRET MESSAGE :) - This is protected data that requires all active subscriptions.',
        }
        
        return JsonResponse(data)
