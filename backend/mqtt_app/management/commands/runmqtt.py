from django.core.management.base import BaseCommand
import paho.mqtt.client as mqtt
from pymongo import MongoClient
from datetime import datetime
import json

class Command(BaseCommand):
    help = "Run MQTT subscriber to save PZEM data into MongoDB"

    def handle(self, *args, **kwargs):
        broker = "test.mosquitto.org"   # ganti dengan IP broker Mosquitto lokal kalau ada
        port = 1883
        topic = "iot/lab/pzem004t"

        # koneksi MongoDB
        client_mongo = MongoClient("mongodb://localhost:27017/")
        db = client_mongo["iot_db"]
        collection = db["pzem_data1"]

        def on_connect(client, userdata, flags, rc):
            print("Connected with result code " + str(rc))
            client.subscribe(topic)
            print(f"Subscribed to topic: {topic}")

        def on_message(client, userdata, msg):
            payload = msg.payload.decode()
            print("RAW:", payload)
            try:
                data = json.loads(payload)

                # Validasi: device_id harus ada
                if "device_id" not in data:
                    print("WARNING: device_id not found in payload. Data will not be saved.")
                    print("Please update your ESP32/Arduino code to include device_id")
                    return

                # Tambahkan timestamp server-side (override jika ada)
                data["timestamp"] = datetime.utcnow()

                # Simpan ke MongoDB
                collection.insert_one(data)
                print(f"✓ Saved data from device: {data['device_id']}")
                print(f"  Voltage: {data.get('voltage', 'N/A')}V, Current: {data.get('current', 'N/A')}A, Power: {data.get('power', 'N/A')}W")
            except json.JSONDecodeError as e:
                print(f"JSON Error: {e}")
            except Exception as e:
                print(f"Error: {e}")

        # MQTT client setup
        client = mqtt.Client()
        client.on_connect = on_connect
        client.on_message = on_message
        
        print(f"Connecting to MQTT broker: {broker}:{port}")
        client.connect(broker, port, 60)

        print(f"Listening on topic: {topic}")
        print("Waiting for messages... (Press Ctrl+C to stop)")
        client.loop_forever()
