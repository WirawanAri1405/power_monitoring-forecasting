# ESP32/Arduino MQTT Integration Guide
# Panduan Integrasi ESP32/Arduino dengan Multi-Device Support

## 📡 Overview

Setiap ESP32/Arduino harus mengirim `device_id` dalam payload MQTT agar sistem dapat membedakan data dari device yang berbeda.

## 🔧 Setup ESP32/Arduino

### 1. Install Library yang Diperlukan

```cpp
// Di Arduino IDE, install library berikut via Library Manager:
// - WiFi (built-in untuk ESP32)
// - PubSubClient (by Nick O'Leary)
// - ArduinoJson (by Benoit Blanchon)
// - PZEM004Tv30 (by Jakub Mandula)
```

### 2. Kode Lengkap ESP32

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <PZEM004Tv30.h>

// ========== KONFIGURASI - EDIT BAGIAN INI ==========
// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Broker
const char* mqtt_server = "YOUR_MQTT_BROKER_IP";  // Misal: "192.168.1.100"
const int mqtt_port = 1883;
const char* mqtt_topic = "iot/lab/pzem004t";

// DEVICE ID - PENTING! Ambil dari dashboard setelah create device
// Login ke dashboard -> Device Management -> Create Device -> Copy device_id
const char* DEVICE_ID = "PASTE_DEVICE_ID_HERE";  // Contoh: "abc-123-def-456"

// PZEM Configuration (RX, TX pins)
const int PZEM_RX_PIN = 16;
const int PZEM_TX_PIN = 17;
// ====================================================

WiFiClient espClient;
PubSubClient client(espClient);
PZEM004Tv30 pzem(Serial2, PZEM_RX_PIN, PZEM_TX_PIN);

unsigned long lastMsg = 0;
const long interval = 2000;  // Send data every 2 seconds

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== ESP32 PZEM MQTT Client ===");
  
  // Connect to WiFi
  setupWiFi();
  
  // Setup MQTT
  client.setServer(mqtt_server, mqtt_port);
  
  Serial.println("Setup complete!");
}

void loop() {
  // Maintain MQTT connection
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();
  
  // Send data every interval
  unsigned long now = millis();
  if (now - lastMsg > interval) {
    lastMsg = now;
    sendSensorData();
  }
}

void setupWiFi() {
  delay(10);
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    // Create unique client ID
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println("connected!");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds...");
      delay(5000);
    }
  }
}

void sendSensorData() {
  // Read PZEM data
  float voltage = pzem.voltage();
  float current = pzem.current();
  float power = pzem.power();
  float energy = pzem.energy();
  float frequency = pzem.frequency();
  float pf = pzem.pf();
  
  // Check if reading is valid
  if (isnan(voltage)) {
    Serial.println("Error reading PZEM sensor!");
    return;
  }
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["device_id"] = DEVICE_ID;  // PENTING! Jangan lupa field ini
  doc["voltage"] = voltage;
  doc["current"] = current;
  doc["power"] = power;
  doc["pf"] = pf;
  doc["frequency"] = frequency;
  doc["energy"] = energy;
  
  // Serialize to JSON string
  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);
  
  // Publish to MQTT
  if (client.publish(mqtt_topic, jsonBuffer)) {
    Serial.println("✓ Data sent:");
    Serial.println(jsonBuffer);
  } else {
    Serial.println("✗ Failed to send data");
  }
}
```

## 📋 Langkah-langkah Setup

### Step 1: Buat Device di Dashboard

1. Login ke dashboard web: `http://localhost:5173/login`
2. Klik device selector di sidebar
3. Klik "Manage Devices"
4. Klik "Add New Device"
5. Isi form:
   - **Name:** "ESP32 Ruang Tamu" (atau nama lain)
   - **Location:** "Ruang Tamu" (opsional)
6. Klik "Create"
7. **COPY device_id** yang muncul (format UUID seperti: `abc-123-def-456`)

### Step 2: Update Kode ESP32

1. Buka Arduino IDE
2. Paste kode di atas
3. Edit bagian konfigurasi:
   ```cpp
   const char* ssid = "NamaWiFiAnda";
   const char* password = "PasswordWiFi";
   const char* mqtt_server = "192.168.1.100";  // IP komputer yang running MQTT broker
   const char* DEVICE_ID = "abc-123-def-456";  // Paste device_id dari Step 1
   ```
4. Upload ke ESP32

### Step 3: Jalankan MQTT Consumer

Di terminal backend:
```bash
cd backend
python manage.py runmqtt
```

Output yang diharapkan:
```
Connecting to MQTT broker: test.mosquitto.org:1883
Connected with result code 0
Subscribed to topic: iot/lab/pzem004t
Listening on topic: iot/lab/pzem004t
Waiting for messages... (Press Ctrl+C to stop)

RAW: {"device_id":"abc-123-def-456","voltage":220.5,"current":5.2,"power":1146.6,"pf":1.0,"frequency":50.0,"energy":125.5}
✓ Saved data from device: abc-123-def-456
  Voltage: 220.5V, Current: 5.2A, Power: 1146.6W
```

### Step 4: Verifikasi di Dashboard

1. Buka dashboard: `http://localhost:5173/monitoring`
2. Pilih device dari dropdown di sidebar
3. Data real-time akan muncul di gauge meters dan charts

## 🔄 Multiple Devices

Untuk menambah device kedua, ketiga, dst:

1. **Buat device baru** di dashboard (ulangi Step 1)
2. **Copy device_id** yang baru
3. **Upload kode ke ESP32 kedua** dengan device_id yang berbeda
4. Semua device akan mengirim ke topic yang sama
5. Backend akan otomatis memisahkan data berdasarkan device_id

## 📊 Format Data MQTT

**Topic:** `iot/lab/pzem004t`

**Payload (JSON):**
```json
{
  "device_id": "abc-123-def-456",  // WAJIB!
  "voltage": 220.5,
  "current": 5.2,
  "power": 1146.6,
  "pf": 1.0,
  "frequency": 50.0,
  "energy": 125.5
}
```

**Field yang WAJIB:**
- `device_id` - untuk identifikasi device

**Field opsional (tapi direkomendasikan):**
- `voltage`, `current`, `power`, `pf`, `frequency`, `energy`

## 🐛 Troubleshooting

### Problem: "device_id not found in payload"

**Solusi:**
- Pastikan kode ESP32 sudah include `doc["device_id"] = DEVICE_ID;`
- Pastikan DEVICE_ID sudah diisi dengan nilai yang benar

### Problem: Data tidak muncul di dashboard

**Checklist:**
1. ✓ MQTT consumer running? (`python manage.py runmqtt`)
2. ✓ ESP32 connected to WiFi?
3. ✓ ESP32 connected to MQTT broker?
4. ✓ Device sudah dibuat di dashboard?
5. ✓ Device sudah dipilih sebagai active device?
6. ✓ device_id di ESP32 sama dengan di database?

### Problem: MQTT connection failed

**Solusi:**
- Pastikan MQTT broker running
- Cek IP address broker sudah benar
- Cek firewall tidak block port 1883

## 📝 Notes

- Timestamp akan otomatis ditambahkan oleh backend
- Data disimpan ke MongoDB collection `iot_db.pzem_data1`
- Setiap device bisa punya nama dan lokasi yang berbeda
- Dashboard akan otomatis filter data berdasarkan active device
