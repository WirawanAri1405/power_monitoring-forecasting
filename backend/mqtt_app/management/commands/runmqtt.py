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

        def on_message(client, userdata, msg):
            payload = msg.payload.decode()
            print("RAW:", payload)
            try:
                data = json.loads(payload)

                # Tambahkan timestamp server-side
                data["timestamp"] = datetime.utcnow()

                # Simpan ke MongoDB
                collection.insert_one(data)
                print("Saved:", data)
            except Exception as e:
                print("Error:", e)

        # MQTT client setup
        client = mqtt.Client()
        client.on_connect = on_connect
        client.on_message = on_message
        client.connect(broker, port, 60)

        print(f"Listening on topic: {topic}")
        client.loop_forever()
