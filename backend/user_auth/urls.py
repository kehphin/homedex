# urls.py
from django.urls import path
from .views import CustomLogoutView

urlpatterns = [
    # overriding django all-auth logout to delete cookies
    # All other django auth routes are part of the all-auth package
    path('logout/', CustomLogoutView.as_view(), name='custom_logout'),
]