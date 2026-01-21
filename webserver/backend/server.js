import express from "express";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";
import { Coffeemaker } from "./devices/Coffeemaker.js";
import { handleDeviceConnection, handleClientConnection } from "./services/WebSocketServices.js";

dotenv.config();

const app = express();
app.use(express.json());

const server = http.createServer(app);

const wss = new WebSocketServer({ noServer: true });

const PORT = process.env.SERVER_PORT || 5000;
const HEARTBEAT_INTERVAL = 30000;

const devices = new Map();
const clients = new Set(); //Works for now, when users come in need better structure.

//============================== Websocket server ==========================

wss.on("connection", (ws, req) => {
  if (req.url === "/ws/iot") {
    ws.isAlive = true;
    handleDeviceConnection(ws, req, devices);
    return;
  }
  else if (req.url === "/ws/frontend") {
    clients.add(ws);
    ws.isAlive = true;
    console.log("New Client added.");
    handleClientConnection(ws, req, clients);
    return;
  }

  ws.close(1008, "Unknown endpoint");
});


/**
 * Upgrade http protocol to websocket.
 */
server.on("upgrade", (req, socket, head) => {
  console.log(req.url);
  if (req.url === "/ws/frontend" || req.url === "/ws/iot") {
    wss.handleUpgrade(req, socket, head, ws => {
      //send connection event to "myself" behalf of client.
      wss.emit("connection", ws, req);
    });
    return;
  }

  socket.destroy();
});


/**
 * Set background task to ping frontend client reqularly to keep the connection up.
 */
setInterval(() => {
      clients.forEach(ws => {
          if (ws.isAlive === false) {
              console.log("Terminating dead socket");
              return ws.terminate();
          }
          ws.isAlive = false;
          ws.ping();
      });
  }, HEARTBEAT_INTERVAL);

//============================ Rest API ===================================

app.get('/api/devices', (req, res) => {
  const deviceArray = [];
  for (const [id, device] of devices) {
    const funcs = [];
    for (const key in device.functions) {
      funcs.push(device.functions[key]);
    }
    deviceArray.push({
      id: id,
      name: device.name,
      functions: funcs,
      active: device.active,
    });
  }
  res.json(deviceArray);
});

/**
 *  turn on any device connected.
 *  
 */
app.post('/api/turnon', (req, res) => {
  const device_id = req.body?.id;
  const command_id = req.body?.code;
  const device = devices.get(device_id);
  if (device_id && command_id) {
    console.log(device_id);
    device.send_command(command_id);
  }
  res.send("ok");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});