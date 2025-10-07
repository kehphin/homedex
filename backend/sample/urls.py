# urls.py
from django.urls import path
from sample import views

urlpatterns = [
    # These samples are for demonstration purposes only
    # They are illustrating how to use the permissions classes provided
    # in the payments app to protect views based on user purchases and subscriptions
    path('download-file/', views.DownloadProtectedFile.as_view(), name='download_protected_file'),
    path('get-protected-data-subscriptions-any/', views.GetProtectedDataSubscriptionsAny.as_view(), name='get_protected_data_any'),
]