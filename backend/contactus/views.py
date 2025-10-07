from django.conf import settings
from django.shortcuts import render
from rest_framework import status, views, permissions
from rest_framework.response import Response

from .models import ContactUs
from django.core.mail import send_mail


class ContactUsAPIView(views.APIView):
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