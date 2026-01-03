from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from pymongo import MongoClient
import datetime
from .models import Device

def get_db_collection():
    """Helper to get MongoDB collection"""
    client = MongoClient("mongodb://localhost:27017/")
    db = client["iot_db"]
    return db["pzem_data1"]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monitoring_api(request):
    """
    Get latest monitoring data point for a specific device
    
    Query Parameters:
        device_id (required): Device ID to get data for
    """
    try:
        device_id = request.GET.get('device_id')
        
        if not device_id:
            return JsonResponse({
                "error": "device_id parameter is required"
            }, status=400)
        
        # Validate device ownership
        try:
            device = Device.objects.get(device_id=device_id, user=request.user)
        except Device.DoesNotExist:
            return JsonResponse({
                "error": "Device not found or you do not have permission to access it"
            }, status=403)
        
        collection = get_db_collection()
        latest_data = collection.find_one(
            {"device_id": device_id},
            sort=[("timestamp", -1)]
        )

        if latest_data:
            latest_data.pop('_id', None)
            ts = latest_data.get('timestamp')
            if isinstance(ts, datetime.datetime):
                latest_data['timestamp'] = ts.isoformat()
            
            data = {
                "device_id": device_id,
                "device_name": device.name,
                "timestamp": latest_data.get('timestamp'),
                "voltage": latest_data.get('voltage', 0),
                "current": latest_data.get('current', 0),
                "power": latest_data.get('power', 0),
                "pf": latest_data.get('pf', 1.0),
                "frequency": latest_data.get('frequency', 50.0),
                "energy": latest_data.get('energy', 0)
            }
        else:
            data = {
                "device_id": device_id,
                "device_name": device.name,
                "timestamp": datetime.datetime.now().isoformat(),
                "voltage": 0,
                "current": 0,
                "power": 0,
                "pf": 1.0,
                "frequency": 50.0,
                "energy": 0,
                "message": "No data available for this device"
            }
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monitoring_history(request):
    """
    Get historical monitoring data based on time range for a specific device
    
    Query Parameters:
        device_id (required): Device ID to get data for
        range (optional): Time range - '1h', '6h', '24h', '7d' (default: '1h')
    """
    try:
        device_id = request.GET.get('device_id')
        
        if not device_id:
            return JsonResponse({
                "error": "device_id parameter is required"
            }, status=400)
        
        # Validate device ownership
        try:
            device = Device.objects.get(device_id=device_id, user=request.user)
        except Device.DoesNotExist:
            return JsonResponse({
                "error": "Device not found or you do not have permission to access it"
            }, status=403)
        
        time_range = request.GET.get('range', '1h')
        collection = get_db_collection()
        
        now = datetime.datetime.now()
        if time_range == '1h':
            delta = datetime.timedelta(hours=1)
        elif time_range == '6h':
            delta = datetime.timedelta(hours=6)
        elif time_range == '24h':
            delta = datetime.timedelta(days=1)
        elif time_range == '7d':
            delta = datetime.timedelta(days=7)
        else:
            delta = datetime.timedelta(hours=1)
            
        start_time = now - delta
        
        cursor = collection.find({
            "device_id": device_id,
            "timestamp": {"$gte": start_time}
        }).sort("timestamp", 1)
        
        history_data = []
        for doc in cursor:
            doc.pop('_id', None)
            ts = doc.get('timestamp')
            if isinstance(ts, datetime.datetime):
                doc['timestamp'] = ts.isoformat()
            history_data.append(doc)
            
        return JsonResponse({
            "device_id": device_id,
            "device_name": device.name,
            "range": time_range,
            "count": len(history_data),
            "data": history_data
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def monitoring_home(request):
    return JsonResponse({
        "message": "Power Monitoring API",
        "endpoints": {
            "/monitoring/api/": "Latest real-time data (requires device_id parameter)",
            "/monitoring/history/": "Historical data with ?device_id=<id>&range=1h|6h|24h|7d",
            "/monitoring/devices/": "Device management (list/create)",
            "/monitoring/devices/<device_id>/": "Device detail (get/update/delete)"
        }
    })
