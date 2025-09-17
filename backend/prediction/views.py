from django.http import JsonResponse
from django.shortcuts import render
import random

def prediction_home(request):
    return render(request, 'prediction/home.html')

def run_prediction(request):
    forecast_value = random.randint(100, 500)  # dummy prediksi
    return JsonResponse({"predicted_power": forecast_value})
