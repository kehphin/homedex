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

from .models import (
    Home, HomeMembership, UserHomeContext,
    ContactUs, HomeProfile, HomeLocation, HomeComponent, ComponentImage, ComponentAttachment,
    Document, Task, RecurringTaskInstance, Appointment, MaintenanceHistory, MaintenanceAttachment,
    Contractor, Notification, NotificationPreference
)
from .serializers import (
    HomeSerializer, HomeMembershipSerializer, UserHomeContextSerializer,
    HomeProfileSerializer, HomeLocationSerializer, HomeComponentSerializer, DocumentSerializer,
    TaskSerializer, AppointmentSerializer, MaintenanceHistorySerializer, ContractorSerializer,
    ContractorDetailSerializer, NotificationSerializer, NotificationPreferenceSerializer
)
from .recurring_tasks import get_recurring_task_stats
from django.core.mail import send_mail

# Helper function to get current home
def get_current_home(request):
    """Get the user's current home context"""
    if not request.user.is_authenticated:
        return None
        
    try:
        context = request.user.home_context
        if context.current_home:
            return context.current_home
    except (UserHomeContext.DoesNotExist, AttributeError):
        pass
    
    # Fallback: Return user's primary home if context doesn't exist
    try:
        membership = HomeMembership.objects.filter(user=request.user, is_primary=True).first()
        if membership:
            # Auto-create context
            context, created = UserHomeContext.objects.get_or_create(
                user=request.user,
                defaults={'current_home': membership.home}
            )
            if not context.current_home:
                context.current_home = membership.home
                context.save()
            return membership.home
    except Exception as e:
        print(f"Error getting current home: {e}")
        pass
    
    # Last resort: return any home the user has access to
    try:
        membership = HomeMembership.objects.filter(user=request.user).first()
        if membership:
            context, created = UserHomeContext.objects.get_or_create(
                user=request.user,
                defaults={'current_home': membership.home}
            )
            if not context.current_home:
                context.current_home = membership.home
                context.save()
            return membership.home
    except Exception as e:
        print(f"Error getting any home: {e}")
        pass
        
    return None

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


# ===== Home Management Views =====

class HomeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing homes
    """
    serializer_class = HomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Get all homes the user has access to"""
        return Home.objects.filter(memberships__user=self.request.user).distinct()

    def create(self, request):
        """Create a new home and claim it"""
        address = request.data.get('address', '').strip()

        if not address:
            return Response(
                {'error': 'Address is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if address is already taken
        if Home.objects.filter(address__iexact=address).exists():
            return Response(
                {'error': f'A home with address "{address}" already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create the home
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            home = serializer.save()

            # Create membership for the user as owner
            membership = HomeMembership.objects.create(
                user=request.user,
                home=home,
                role='owner',
                is_primary=not HomeMembership.objects.filter(user=request.user).exists()
            )

            # Set as current home context if it's the user's first home
            try:
                context = request.user.home_context
                if not context.current_home:
                    context.current_home = home
                    context.save()
            except UserHomeContext.DoesNotExist:
                UserHomeContext.objects.create(
                    user=request.user,
                    current_home=home
                )

            return Response(
                HomeSerializer(home, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def switch(self, request, pk=None):
        """Switch to a different home"""
        home = self.get_object()

        # Verify user has access to this home
        if not home.memberships.filter(user=request.user).exists():
            return Response(
                {'error': 'You do not have access to this home'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Update or create home context
        context, created = UserHomeContext.objects.get_or_create(user=request.user)
        context.current_home = home
        context.save()

        return Response({
            'message': f'Switched to {home.name}',
            'home': HomeSerializer(home, context={'request': request}).data
        })

    @action(detail=True, methods=['post'])
    def set_primary(self, request, pk=None):
        """Set a home as the user's primary home"""
        home = self.get_object()

        try:
            membership = home.memberships.get(user=request.user)
            membership.is_primary = True
            membership.save()  # This will auto-unset other primaries

            return Response({'message': f'{home.name} set as primary home'})
        except HomeMembership.DoesNotExist:
            return Response(
                {'error': 'You are not a member of this home'},
                status=status.HTTP_403_FORBIDDEN
            )

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get the current home context"""
        try:
            context = request.user.home_context
            if context.current_home:
                return Response(
                    HomeSerializer(context.current_home, context={'request': request}).data
                )
            return Response({'error': 'No current home set'}, status=status.HTTP_404_NOT_FOUND)
        except UserHomeContext.DoesNotExist:
            return Response({'error': 'No home context found'}, status=status.HTTP_404_NOT_FOUND)


class HomeProfileViewSet(viewsets.ViewSet):
    """
    ViewSet for managing current home's profile information
    Now uses the Home model instead of the deprecated HomeProfile model
    """
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Get current home's profile"""
        home = get_current_home(request)
        print(f"DEBUG HomeProfileViewSet.list: home={home}, id={home.id if home else None}")
        if not home:
            return Response({'error': 'No home selected'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = HomeSerializer(home, context={'request': request})
        return Response(serializer.data)

    def create(self, request):
        """Create or update current home's profile"""
        home = get_current_home(request)
        if not home:
            return Response({'error': 'No home selected'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = HomeSerializer(home, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        """Get current home's profile (same as list for single resource)"""
        home = get_current_home(request)
        if not home:
            return Response({'error': 'No home selected'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = HomeSerializer(home, context={'request': request})
        return Response(serializer.data)

    def update(self, request, pk=None):
        """Update current home's profile"""
        home = get_current_home(request)
        if not home:
            return Response({'error': 'No home selected'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = HomeSerializer(home, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HomeLocationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing home locations
    """
    serializer_class = HomeLocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter by current home
        home = get_current_home(self.request)
        if home:
            return HomeLocation.objects.filter(home=home)
        return HomeLocation.objects.none()

    def perform_create(self, serializer):
        # Automatically set the home when creating
        home = get_current_home(self.request)
        if not home:
            raise PermissionError('No home selected')
        serializer.save(home=home)


class HomeComponentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing home components (appliances, systems, etc.)
    """
    serializer_class = HomeComponentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter by current home
        home = get_current_home(self.request)
        if home:
            return HomeComponent.objects.filter(home=home)
        return HomeComponent.objects.none()

    def perform_create(self, serializer):
        # Automatically set the home when creating
        home = get_current_home(self.request)
        if not home:
            raise PermissionError('No home selected')
        serializer.save(home=home)

    @action(detail=True, methods=['post'])
    def reorder_images(self, request, pk=None):
        """Reorder images for a component"""
        component = self.get_object()
        image_ids = request.data.get('image_ids', [])

        if not isinstance(image_ids, list):
            return Response(
                {'error': 'image_ids must be a list'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Update order for each image
            for order, image_id in enumerate(image_ids):
                ComponentImage.objects.filter(
                    id=image_id,
                    component=component
                ).update(order=order)

            # Refresh and serialize the component
            component.refresh_from_db()
            serializer = self.get_serializer(component)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

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
        # Filter by current home
        home = get_current_home(self.request)
        if home:
            return Document.objects.filter(home=home)
        return Document.objects.none()

    def perform_create(self, serializer):
        # Automatically set the home when creating
        home = get_current_home(self.request)
        if not home:
            raise PermissionError('No home selected')
        serializer.save(home=home)

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
        # Filter by current home
        home = get_current_home(self.request)
        if home:
            return Task.objects.filter(home=home)
        return Task.objects.none()

    def perform_create(self, serializer):
        # Automatically set the home when creating
        home = get_current_home(self.request)
        if not home:
            raise PermissionError('No home selected')
        serializer.save(home=home)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about user's tasks"""
        queryset = self.get_queryset()
        total = queryset.count()
        pending = queryset.filter(status='pending').count()
        in_progress = queryset.filter(status='in-progress').count()
        completed = queryset.filter(status='completed').count()

        # Get recurring task stats
        recurring_stats = get_recurring_task_stats(request.user)

        return Response({
            'total': total,
            'pending': pending,
            'in_progress': in_progress,
            'completed': completed,
            'recurring': recurring_stats
        })


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing appointments
    """
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter by current home
        home = get_current_home(self.request)
        if home:
            return Appointment.objects.filter(home=home)
        return Appointment.objects.none()

    def perform_create(self, serializer):
        # Automatically set the home when creating
        home = get_current_home(self.request)
        if not home:
            raise PermissionError('No home selected')
        serializer.save(home=home)

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


class MaintenanceHistoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing maintenance history
    """
    serializer_class = MaintenanceHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter by current home
        home = get_current_home(self.request)
        if home:
            return MaintenanceHistory.objects.filter(home=home)
        return MaintenanceHistory.objects.none()

    def perform_create(self, serializer):
        # Automatically set the home when creating
        home = get_current_home(self.request)
        if not home:
            raise PermissionError('No home selected')
        serializer.save(home=home)

    @action(detail=True, methods=['delete'], url_path='attachments/(?P<attachment_id>[^/.]+)')
    def delete_attachment(self, request, pk=None, attachment_id=None):
        """Delete a specific attachment from a maintenance record"""
        maintenance = self.get_object()
        try:
            attachment = MaintenanceAttachment.objects.get(id=attachment_id, maintenance=maintenance)
            attachment.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except MaintenanceAttachment.DoesNotExist:
            return Response(
                {'error': 'Attachment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about user's maintenance history"""
        queryset = self.get_queryset()
        total = queryset.count()

        # Calculate total spent on maintenance
        total_cost = sum(item.price for item in queryset)

        # Get average maintenance cost
        average_cost = total_cost / total if total > 0 else 0

        return Response({
            'total': total,
            'total_cost': float(total_cost),
            'average_cost': float(average_cost)
        })


class ContractorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing contractors
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter by current home
        home = get_current_home(self.request)
        if home:
            return Contractor.objects.filter(home=home)
        return Contractor.objects.none()

    def get_serializer_class(self):
        # Use detailed serializer for retrieve action to include maintenance history
        if self.action == 'retrieve':
            return ContractorDetailSerializer
        return ContractorSerializer

    def perform_create(self, serializer):
        # Automatically set the home when creating
        home = get_current_home(self.request)
        if not home:
            raise PermissionError('No home selected')
        serializer.save(home=home)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about user's contractors"""
        queryset = self.get_queryset()
        total = queryset.count()

        # Calculate total spent through contractors
        total_spent = 0
        for contractor in queryset:
            total_spent += sum(m.price for m in contractor.maintenance_histories.all())

        return Response({
            'total': total,
            'total_spent': float(total_spent)
        })


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing notifications
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        # Users can only see their own notifications
        return Notification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user when creating
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get summary of notifications (overdue, due today, due soon)"""
        from django.utils import timezone
        from datetime import timedelta

        queryset = self.get_queryset()

        overdue = queryset.filter(notification_type='overdue', is_read=False).count()
        due_today = queryset.filter(notification_type='due_today', is_read=False).count()
        due_soon = queryset.filter(notification_type='due_soon', is_read=False).count()

        return Response({
            'overdue': overdue,
            'due_today': due_today,
            'due_soon': due_soon,
            'total': overdue + due_today + due_soon
        })

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a notification as read"""
        from django.utils import timezone
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read"""
        from django.utils import timezone
        queryset = self.get_queryset().filter(is_read=False)
        updated_count = queryset.update(is_read=True, read_at=timezone.now())
        return Response({'updated_count': updated_count})


class NotificationPreferenceViewSet(viewsets.ViewSet):
    """
    ViewSet for managing notification preferences
    """
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Get notification preferences for current user"""
        preference, created = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = NotificationPreferenceSerializer(preference)
        return Response(serializer.data)

    def create(self, request):
        """Create or update notification preferences"""
        preference, created = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = NotificationPreferenceSerializer(preference, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

