# backend/authentication/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Public routes
    path('', views.landing_page, name='landing_page'),
    
    # Authentication endpoints
    path('api/auth/register/', views.register_user, name='register'),
    path('api/auth/login/', views.login_user, name='login'),
    path('api/auth/profile/', views.user_profile, name='profile'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]