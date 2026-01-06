import os
import django
import random
import datetime
from pymongo import MongoClient
from django.utils import timezone

# 1. Setup Django Environment (Hanya untuk akses model Device & User)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wattara.settings')
django.setup()

from django.contrib.auth.models import User
from monitoring.models import Device

def populate_mongodb():
    print("--- Starting Dummy Data Population ---")

    # 2. Setup Koneksi MongoDB
    try:
        # Sesuaikan URI jika MongoDB Anda ada di server lain/docker
        client = MongoClient("mongodb://localhost:27017/") 
        db = client["iot_db"]           # Nama database (sesuai views.py)
        collection = db["pzem_data1"]   # Nama collection (sesuai views.py)
        print("✓ Connected to MongoDB")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        return

    # 3. Pastikan ada User Admin (untuk pemilik device)
    user, created = User.objects.get_or_create(
        username='admin',
        defaults={'email': 'admin@example.com'}
    )
    if created:
        user.set_password('admin123')
        user.save()
        print("✓ Created dummy user: admin")

    # 4. Buat Device Dummy di Django (SQL)
    # ID ini yang nanti menghubungkan data di MongoDB
    DEVICE_ID = "d4fa4f1c-e4cb-40be-b37d-4c7421c070db" 
    
    device, created = Device.objects.get_or_create(
        device_id=DEVICE_ID,
        defaults={
            'name': "Simulation Panel", 
            'location': "Virtual Lab",
            'user': user,
            'is_active': True
        }
    )
    if created:
        print(f"✓ Created Django Device: {device.name} ({DEVICE_ID})")
    else:
        print(f"✓ Found existing Django Device: {device.name}")

    # 5. Generate Data Dummy ke MongoDB
    # Kita hapus data lama device ini agar grafik bersih (Opsional)
    delete_result = collection.delete_many({"device_id": DEVICE_ID})
    print(f"  - Cleared {delete_result.deleted_count} old records for this device.")

    print("  - Generating data for the last 24 hours...")
    
    end_time = datetime.datetime.now()
    start_time = end_time - datetime.timedelta(hours=24)
    current_time = start_time

    bulk_data = []

    while current_time <= end_time:
        # Simulasi nilai listrik naik-turun sedikit
        voltage = 220.0 + random.uniform(-5.0, 5.0)
        current = random.uniform(1.5, 8.0)
        pf = random.uniform(0.85, 0.99)
        power = voltage * current * pf
        frequency = 50.0 + random.uniform(-0.1, 0.1)
        energy = 1000 + (current_time.hour * 5) # Simulasi kWh meter bertambah

        # Format data sesuai yang diharapkan backend/monitoring/views.py
        data_point = {
            "device_id": DEVICE_ID,
            "timestamp": current_time, # PyMongo akan simpan sebagai ISODate
            "voltage": round(voltage, 2),
            "current": round(current, 2),
            "power": round(power, 2),
            "pf": round(pf, 2),
            "frequency": round(frequency, 2),
            "energy": round(energy, 2)
        }
        bulk_data.append(data_point)
        
        # Interval data setiap 15 menit
        current_time += datetime.timedelta(minutes=15)

    # 6. Insert ke MongoDB
    if bulk_data:
        collection.insert_many(bulk_data)
        print(f"✓ Successfully inserted {len(bulk_data)} records into MongoDB!")
    else:
        print("⚠ No data generated.")

if __name__ == '__main__':
    populate_mongodb()
    print("--- Done ---")