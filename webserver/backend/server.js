import express from "express";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";
import { Coffeemaker } from "./devices/Coffeemaker.js";

dotenv.config();

const app = express();
app.use(express.json());

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

const PORT = process.env.SERVER_PORT || 5000;
const devices = new Map();

//============================== Websocket server ==========================

wss.on("connection", (socket, req) => {
  socket.on("message", msg => {
    const data = JSON.parse(msg);
    if (data.device_id) {
      const device = new Coffeemaker(data.device_id, socket);
      devices.set(device.device_id, device);
      console.log("ESP registered:", data.device_id);
    }
    else if (data.payload.response){
      console.log("response: ", data.payload.response);
    }
    if (data.payload?.state){
      console.log("state: ", data.payload.state);
    }
  });

  socket.on("close", () => {
    for (const device in devices) {
      if (device.connection === socket) {
        devices.delete(device.device_id);
        console.log(device.device_id + " disconnected!");
        break;
      }
    }
  });
});

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
  const device_id = req.body.id;
  const device = devices.get(device_id);
  if (device_id) {
    console.log(device_id);
    device.send_command("on");
  }
  res.send("ok");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});