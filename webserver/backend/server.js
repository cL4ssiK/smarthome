import express from "express";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import { WebSocketServer } from "ws";
import { Devices } from "./devices/Devices.js";
import { handleDeviceConnection, handleClientConnection } from "./services/WebSocketServices.js";
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(express.json());

const server = http.createServer(app);

const wss = new WebSocketServer({ noServer: true });

const PORT = process.env.NODE_ENV === 'production' ? 
  process.env.PROD_PORT || 3000 : process.env.SERVER_PORT || 5000;
const HEARTBEAT_INTERVAL = 30000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const devices = new Devices();
const clients = new Set(); //Works for now, when users come in need better structure.

//============================== Websocket server ==========================

wss.on("connection", (ws, req) => {
  if (req.url === "/ws/iot") {
    ws.isAlive = true;
    handleDeviceConnection(ws, req, devices, clients);
    return;
  }
  else if (req.url === "/ws/frontend") {
    clients.add(ws);
    ws.isAlive = true;
    console.log("New Client added.");
    handleClientConnection(ws, req, clients, devices);
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
      wss.clients.forEach(ws => {
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
  const deviceArray = devices.getAllInFrontendFormat();
  res.json(deviceArray);
});

if (process.env.NODE_ENV === 'production') {
  // Serve static files from the build folder
  app.use(express.static(path.join(__dirname, 'public')));

  // The "catchall" for React Router
  app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});