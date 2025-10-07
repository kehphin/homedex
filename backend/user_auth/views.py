from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import logout
from django.http import JsonResponse

class CustomLogoutView(APIView):
    def post(self, request):
        # Perform any custom logic here
        logout(request)
        response = Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        response.delete_cookie('sessionid')
        # Add any other cookies that need to be cleared
        return response
    
