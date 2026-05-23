import express from "express";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import { WebSocketServer } from "ws";
import { handleDeviceConnection, handleClientConnection } from "./services/WebSocketServices.js";
import { fileURLToPath } from 'url';
import { Queue } from "bullmq";
import { AssetManager } from "./AssetManager.js";
import { authenticateToken, logIn, register, logOut, renewToken } from "./services/AuthService.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);

const wss = new WebSocketServer({ noServer: true });

const PORT = process.env.NODE_ENV === 'production' ? 
  process.env.PROD_PORT || 3000 : process.env.SERVER_PORT || 5000;
const HEARTBEAT_INTERVAL = 30000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const assetmanager = new AssetManager();
const clients = new Set(); //Works for now, when users come in need better structure.
//const processQue = new Queue("backgroundtasks", { connection: { host: 'localhost', port: 6379 } });

//============================== Websocket server ==========================

wss.on("connection", (ws, req) => {
  if (req.url === "/ws/iot") {
    ws.isAlive = true;
    handleDeviceConnection(ws, req, assetmanager, clients);
    return;
  }
  else if (req.url === "/ws/frontend") {
    clients.add(ws);
    ws.isAlive = true;
    console.log("New Client added.");
    handleClientConnection(ws, req, assetmanager, clients);
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


app.get('/api/devices', authenticateToken, async (req, res) => {
  const deviceArray = await assetmanager.getAllInFrontendFormat();
  res.json(deviceArray);
});


app.post('/api/refresh', async (req, res) => {
  const rftoken = req.cookies?.refreshtoken;
  
  if (!rftoken) return res.sendStatus(403);

  try {
    const user = await renewToken(rftoken);
    return res.status(200).json(user);
  } catch(err) {
    console.log(err);
    return res.sendStatus(403);
  }
});


app.post('/api/logout', authenticateToken, async (req, res) => {
  try {
    await logOut(req.user);
    console.log(`user ${req.user.username} logged out`);
  } catch(err) {
    console.log(err);
    return res.status(500).json({ success: false });
  }

  res.clearCookie('refreshtoken', {
      httpOnly: true,
      secure: false, // HTTPS only when true
      sameSite: 'strict',
    });

  res.status(200).json({ success: true });
});


app.post('/api/login', async (req, res) => {
  try {
    const { username, pswd1 } = req.body;
    const data = await logIn(username, pswd1);

    res.cookie('refreshtoken', data.refreshtoken, {
      httpOnly: true,
      secure: false, // HTTPS only when true
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      token: data.token,
      user: data.user
    });
  } catch(err) {
    //console.log(err);
    res.json(err);
  }
});


app.post('/api/register', async (req, res) => {
    const error = await register(req?.body.username, req?.body.pswd1);
    if (error) res.json(error);
    else res.status(200).json({ success: true });
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