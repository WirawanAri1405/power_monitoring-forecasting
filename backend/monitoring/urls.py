from django.urls import path
from . import views

urlpatterns = [
    path('', views.monitoring_home, name='monitoring_home'),   # /monitoring/
    path('api/', views.monitoring_api, name='monitoring_api'), # /monitoring/api/
]
