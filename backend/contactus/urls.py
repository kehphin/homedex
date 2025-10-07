# urls.py
from django.urls import path
from contactus import views

urlpatterns = [
    path('contact/', views.ContactUsAPIView.as_view()),
]