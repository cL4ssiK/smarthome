#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

#define LED_PIN 32
#define POWER_BTON_PIN 33
#define STATE_MONITOR_PIN 25

using CommandPtr = void (*)();

typedef struct {
    byte code;
    const char* name;
    bool state;
    bool allowTimer;
} Func;

const char* ssid = "xxxx";
const char* pass = "xxxx";
const char* serverIP = "xxx.xxx.xxx.xxx";
const int serverPort = 1234; 
const char* deviceId = "esp32-001";
const char* deviceType = "coffeemaker";

volatile bool heaterFlag = false;
bool connection = false;
bool ledState = LOW;
unsigned long long lastMillis = millis();

WebSocketsClient webSocket;
JsonDocument doc_rx;
JsonDocument doc_tx;

Func funcNames[] = {
  Func{1, "Brew coffee", HIGH, true}
};

/**
Hardware interrupt routine to read and update machine state.
*/
void ISR() {
  heaterFlag = true;
}

/**
Handles sending function state to server.
*/
void sendFunctionState(Func f) {
  doc_tx.clear();
  
  doc_tx["type"] = "functionstate";
  doc_tx["device_id"] = deviceId;
  doc_tx["func_code"] = f.code;
  doc_tx["payload"]["success"] = true;
  doc_tx["payload"]["state"] = !f.state ? "on" : "off";
  //doc_tx["debug"]["statemonitor"] = digitalRead(STATE_MONITOR_PIN) ? "HIGH" : "LOW";

  
  String json;
  serializeJson(doc_tx, json);
  webSocket.sendTXT(json);
}

/**
Read the machine state and send it to server if it has changed.
*/
void readMachineState() {
  if (heaterFlag) {
    delay(20);
    bool heaterState = digitalRead(STATE_MONITOR_PIN);

    if(heaterState != funcNames[0].state) {
      funcNames[0].state = heaterState;
      sendFunctionState(funcNames[0]);
    }

    heaterFlag = false;
  }
}

/**
Turn the device on/off.
*/
void coffeemakerOn() {
  /** Simulate "push" of the button. Use this with coffeemaker.*/
  digitalWrite(POWER_BTON_PIN, HIGH);
  delay(100);
  digitalWrite(POWER_BTON_PIN, LOW);
}

/**
Array of command functions.
*/
CommandPtr commands[] = {
  coffeemakerOn
};

/**
Map command code to array of corresponding functions.
Currently codes need to be continuous set of integers from 1 to n.
*/
void handleCommand(int cmindex) {
  commands[cmindex - 1]();
}

/**
Handles the websocket events.
Connect: 
  - Set indicator LED on.
  - Send device information for server.
Message(text):
  - Deserialize json data.
  - Call function corresponding the received code.
Disconnect:
  - Turn off indicator LED
*/
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  if(type == WStype_CONNECTED) {
    Serial.println("Connected to server");
    connection = true;
    digitalWrite(LED_PIN, HIGH);

    doc_tx.clear();
  
    doc_tx["type"] = "register";
    doc_tx["device_id"] = deviceId;

    JsonArray functions = doc_tx["payload"].createNestedArray("functions");
    for (byte i = 0; i < sizeof(funcNames)/sizeof(Func); ++i) {
      JsonObject obj = functions.createNestedObject();
      obj["code"] = funcNames[i].code;
      obj["name"] = funcNames[i].name;
      obj["allowtimer"] = funcNames[i].allowTimer;
      obj["initialstate"] = !funcNames[i].state ? "on" : "off";
    }

    doc_tx["payload"]["devicetype"] = deviceType;

    String json;
    serializeJson(doc_tx, json);
    webSocket.sendTXT(json);
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
    connection = false;
    digitalWrite(LED_PIN, LOW);
  }
}


void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(POWER_BTON_PIN, OUTPUT);
  pinMode(STATE_MONITOR_PIN, INPUT_PULLUP);

  attachInterrupt(STATE_MONITOR_PIN, ISR, CHANGE);

  funcNames[0].state = digitalRead(STATE_MONITOR_PIN);

  Serial.begin(115200);
  WiFi.begin(ssid, pass);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState);
  }
  Serial.println("\nWiFi connected");
  webSocket.begin(serverIP, serverPort, "/ws/iot");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000); // auto reconnect every 5s
}

//TODO: Replace the simple led blinking with timed interrupt. This way led blinks constantly, even with websocket.loop() function.
void loop() {
  webSocket.loop(); // must call frequently
  readMachineState();
  if (!connection && millis() - lastMillis >= 500) {
    lastMillis = millis();
    digitalWrite(LED_PIN, ledState);
    ledState = !ledState;
  }
}
