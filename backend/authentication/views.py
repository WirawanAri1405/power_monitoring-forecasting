# backend/authentication/views.py

from django.http import JsonResponse

def landing_page(request):
    return JsonResponse({"message": "This is the landing page."})

def login_page(request):
    return JsonResponse({"message": "This is the login page."})