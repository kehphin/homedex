from django.conf import settings
from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from django.http import FileResponse, JsonResponse

from payments.permissions import HasPurchasedProduct, HasAnyActiveSubscription, HasAllActiveSubscriptions
from rest_framework import permissions
import os

from .models import ContactUs, HomeComponent, ComponentImage, ComponentAttachment, Document, Task, Appointment
from .serializers import HomeComponentSerializer, DocumentSerializer, TaskSerializer, AppointmentSerializer
from django.core.mail import send_mail

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


class ContactUsAPIView(APIView):
    permissions = []

    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        message = request.data.get('message')
        contact = ContactUs.objects.create(name=name, email=email, message=message)

        if settings.SEND_EMAIL_FOR_CONTACT_US and settings.CONTACT_US_RECIPIENT_EMAIL:
            send_email_for_contact_us(name, email, message)

        return Response({'message': 'Contact Us form submitted successfully.'}, status=status.HTTP_200_OK)


def send_email_for_contact_us(name, email, message):
    subject = f'New Contact Us form submission from {name}'
    message = f'Name: {name}\nEmail: {email}\nMessage: {message}'
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [settings.CONTACT_US_RECIPIENT_EMAIL])


class HomeComponentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing home components (appliances, systems, etc.)
    """
    serializer_class = HomeComponentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own components
        return HomeComponent.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user when creating
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['delete'], url_path='images/(?P<image_id>[^/.]+)')
    def delete_image(self, request, pk=None, image_id=None):
        """Delete a specific image from a component"""
        component = self.get_object()
        try:
            image = ComponentImage.objects.get(id=image_id, component=component)
            image.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ComponentImage.DoesNotExist:
            return Response(
                {'error': 'Image not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['delete'], url_path='attachments/(?P<attachment_id>[^/.]+)')
    def delete_attachment(self, request, pk=None, attachment_id=None):
        """Delete a specific attachment from a component"""
        component = self.get_object()
        try:
            attachment = ComponentAttachment.objects.get(id=attachment_id, component=component)
            attachment.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ComponentAttachment.DoesNotExist:
            return Response(
                {'error': 'Attachment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about user's components"""
        from django.utils import timezone

        queryset = self.get_queryset()
        total = queryset.count()

        today = timezone.now().date()
        needs_maintenance = queryset.filter(next_maintenance__lt=today).count()
        under_warranty = queryset.filter(warranty_expiration__gt=today).count()

        return Response({
            'total': total,
            'needs_maintenance': needs_maintenance,
            'under_warranty': under_warranty
        })


class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing home documents
    """
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own documents
        return Document.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user when creating
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about user's documents"""
        from django.utils import timezone

        queryset = self.get_queryset()
        total = queryset.count()

        current_year = timezone.now().year
        this_year = queryset.filter(year=str(current_year)).count()

        categories = queryset.values('category').distinct().count()

        total_size = sum(doc.file_size for doc in queryset)

        return Response({
            'total': total,
            'this_year': this_year,
            'categories': categories,
            'total_size': total_size
        })


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing home tasks
    """
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own tasks
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user when creating
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about user's tasks"""
        queryset = self.get_queryset()
        total = queryset.count()
        pending = queryset.filter(status='pending').count()
        in_progress = queryset.filter(status='in-progress').count()
        completed = queryset.filter(status='completed').count()

        return Response({
            'total': total,
            'pending': pending,
            'in_progress': in_progress,
            'completed': completed
        })


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing appointments
    """
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own appointments
        return Appointment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user when creating
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an appointment"""
        appointment = self.get_object()
        appointment.status = 'cancelled'
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='available-times')
    def available_times(self, request):
        """
        Get available time slots for a specific date
        This is a simplified implementation - in production, you would:
        1. Check actual provider availability
        2. Consider existing appointments
        3. Apply business hours logic
        """
        from datetime import datetime, time, timedelta

        date_str = request.query_params.get('date')
        if not date_str:
            return Response(
                {'error': 'date parameter is required (YYYY-MM-DD)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            requested_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get existing appointments for this date and user
        existing_appointments = Appointment.objects.filter(
            user=request.user,
            appointment_date=requested_date
        ).exclude(status='cancelled').values_list('appointment_time', flat=True)

        # Generate time slots from 8 AM to 6 PM in 30-minute intervals
        available_times = []
        start_time = time(8, 0)
        end_time = time(18, 0)
        current_time = datetime.combine(requested_date, start_time)
        end_datetime = datetime.combine(requested_date, end_time)

        while current_time < end_datetime:
            time_slot = current_time.time()
            # Check if this time slot is not already booked
            if time_slot not in existing_appointments:
                available_times.append(time_slot.strftime('%H:%M'))
            current_time += timedelta(minutes=30)

        return Response({
            'date': date_str,
            'available_times': available_times
        })

