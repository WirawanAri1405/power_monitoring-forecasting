from django.urls import path
from . import views
from . import device_views

urlpatterns = [
    # Monitoring endpoints
    path('', views.monitoring_home, name='monitoring_home'),
    path('api/', views.monitoring_api, name='monitoring_api'),
    path('history/', views.monitoring_history, name='monitoring_history'),
    
    # Device management endpoints
    path('devices/', device_views.device_list_create, name='device_list_create'),
    path('devices/<str:device_id>/', device_views.device_detail, name='device_detail'),
]
