# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from owner import views

router = DefaultRouter()
router.register(r'home-profile', views.HomeProfileViewSet, basename='homeprofile')
router.register(r'components', views.HomeComponentViewSet, basename='homecomponent')
router.register(r'documents', views.DocumentViewSet, basename='document')
router.register(r'tasks', views.TaskViewSet, basename='task')
router.register(r'appointments', views.AppointmentViewSet, basename='appointment')
router.register(r'maintenance', views.MaintenanceHistoryViewSet, basename='maintenance')
router.register(r'contractors', views.ContractorViewSet, basename='contractor')

urlpatterns = [
    # These samples are for demonstration purposes only
    # They are illustrating how to use the permissions classes provided
    # in the payments app to protect views based on user purchases and subscriptions
    path('download-file/', views.DownloadProtectedFile.as_view(), name='download_protected_file'),
    path('get-protected-data-subscriptions-any/', views.GetProtectedDataSubscriptionsAny.as_view(), name='get_protected_data_any'),
    path('contact/', views.ContactUsAPIView.as_view(), name='contact_us'),

    # Home Components API
    path('', include(router.urls)),
]
