from django.urls import path
from . import views

urlpatterns = [
    path('', views.prediction_home, name='prediction_home'),   # /prediction/
    path('run/', views.run_prediction, name='run_prediction'), # /prediction/run/
]
