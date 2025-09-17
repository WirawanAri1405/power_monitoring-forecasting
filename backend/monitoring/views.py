from django.http import JsonResponse
from django.shortcuts import render
import datetime

def monitoring_home(request):
    return render(request, 'monitoring/home.html')

def monitoring_api(request):
    data = {
        "timestamp": datetime.datetime.now().isoformat(),
        "voltage": 220,
        "current": 1.5,
        "power": 330
    }
    return JsonResponse(data)
