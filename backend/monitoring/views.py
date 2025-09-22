from django.http import JsonResponse
from pymongo import MongoClient
import datetime

# Fungsi ini sekarang akan mengambil data terbaru dari MongoDB
def monitoring_api(request):
    try:
        # Koneksi ke MongoDB
        client = MongoClient("mongodb://localhost:27017/")
        db = client["iot_db"]
        collection = db["pzem_data1"]

        # Ambil dokumen terbaru berdasarkan timestamp
        latest_data = collection.find_one(sort=[("timestamp", -1)])

        if latest_data:
            # Hapus _id karena tidak bisa di-serialize ke JSON secara default
            latest_data.pop('_id', None)
            # Pastikan timestamp dalam format string
            latest_data['timestamp'] = latest_data.get('timestamp', datetime.datetime.now()).isoformat()
            
            # Ganti nama field agar sesuai dengan yang diharapkan frontend
            data = {
                "timestamp": latest_data['timestamp'],
                "voltage": latest_data.get('voltage', 0),
                "current": latest_data.get('current', 0),
                "power": latest_data.get('power', 0)
            }
        else:
            # Data default jika koleksi kosong
            data = {
                "timestamp": datetime.datetime.now().isoformat(),
                "voltage": 0,
                "current": 0,
                "power": 0
            }
            
        return JsonResponse(data)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# monitoring_home tidak lagi diperlukan jika kita menggunakan React
# Anda bisa menghapusnya atau membiarkannya
def monitoring_home(request):
    # Logika ini tidak akan digunakan oleh React, tapi kita biarkan saja
    return JsonResponse({"message": "This is the monitoring home. Use /api/ to get data."})