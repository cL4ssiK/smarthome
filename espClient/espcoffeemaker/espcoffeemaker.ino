#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

#define LED_PIN 32
#define COFFEEMAKER_ON_PIN 33

using CommandPtr = void (*)();

const char* ssid = "Elisa_Mobi_C0E4";
const char* pass = "AAJ4788GGY4QN";
const char* serverIP = "192.168.100.17"; // Node.js server
const int serverPort = 5000;

bool heaterOn = false;

WebSocketsClient webSocket;
JsonDocument doc_rx;
JsonDocument doc_tx;


void coffeemakerOn() {
  heaterOn = !heaterOn;
  digitalWrite(COFFEEMAKER_ON_PIN, heaterOn);
  /** Simulate "push" of the button.
  delay(100);
  digitalWrite(COFFEEMAKER_ON_PIN, LOW);
  */
  doc_tx.clear();
  
  doc_tx["type"] = "state";
  doc_tx["payload"]["response"] = true;
  doc_tx["payload"]["state"] = heaterOn ? "on" : "off";
  
  String json;
  serializeJson(doc_tx, json);
  webSocket.sendTXT(json);
}

/**
Array of command functions.
*/
CommandPtr commands[] = {
  coffeemakerOn

};

void handleCommand(int cmindex) {
  commands[cmindex - 1]();
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  if(type == WStype_CONNECTED) {
    Serial.println("Connected to server");
    digitalWrite(LED_PIN, HIGH);
    // Send device ID on connect
    webSocket.sendTXT("{\"type\":\"register\",\"device_id\":\"esp32-001\"}");
  }
  else if(type == WStype_TEXT) {
    const char* msg = (char*)payload;
    // Parse JSON & handle commands
    doc_rx.clear();
    DeserializationError err = deserializeJson(doc_rx, msg);
    if (err) {
      Serial.print(F("deserializeJson() failed: "));
      Serial.println(err.c_str());
      return;
    }
    const char* type = doc_rx["type"];
    if (type && strcmp(type, "command") == 0) {
      int command = doc_rx["payload"]["command"];
      handleCommand(command);
    }

  }
  else if(type == WStype_DISCONNECTED) {
    Serial.println("Disconnected!");
    digitalWrite(LED_PIN, LOW);
  }
}

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(COFFEEMAKER_ON_PIN, OUTPUT);
  Serial.begin(115200);
  WiFi.begin(ssid, pass);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  webSocket.begin(serverIP, serverPort, "/");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000); // auto reconnect every 5s
}

void loop() {
  webSocket.loop(); // must call frequently
}
