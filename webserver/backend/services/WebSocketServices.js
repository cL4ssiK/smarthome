import { AssetManager } from "../AssetManager.js";

/**
 * Handles websocket communication between server and IoT device.
 * @param {WebSocket} ws 
 * @param {Object} req 
 * @param {AssetManager} assetmanager 
 * @param {Set} clients 
 */
function handleDeviceConnection(ws, req, assetmanager, clients) {
    /**
     * Message structure:
     * {
     *    type: "register",
     *    device_id: "xxx",
     *    device_type: "eg. coffeemaker"
     * }
     * or
     * {
     *    type: "functionstate",
     *    device_id: "xxx",
     *    func_code: 1-x
     *    payload: {
     *        success: true/false,
     *        state: "on/off"
     *    }
     * }
     */
    ws.on("message", async msg => {
        const data = JSON.parse(msg);
        //TODO: Check validity of data.

        if (data.type === "register") {

          if (!(await assetmanager.activateDevice(data, ws))) {

            const success = await assetmanager.registerNewDevice(data);
            console.log(success);
            if (success) {
              await assetmanager.activateDevice(data, ws);
              console.log("Device registered:", data.device_id);
            }
          }
          else console.log("Device connected:", data.device_id);

          sendDeviceUpdate(clients);
        }
        else if (data.type === "functionstate"){
          assetmanager.changeFunctionState(data);
          sendDeviceUpdate(clients);
        }
    });

  ws.on("close", () => {
    assetmanager.disconnectDevice(ws);
    sendDeviceUpdate(clients);
  });

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("error", () => {
    console.log("Error, Ws terminated.");
    ws.terminate();
    assetmanager.disconnectDevice(ws);
    sendDeviceUpdate(clients);
  });
}


//TODO: fix the issue that deviceupdate is only sent if state changes on timed call.
/**
 * Handles websocket communication between server and client.
 * @param {WebSocket} ws 
 * @param {Object} req 
 * @param {AssetManager} assetmanager 
 * @param {Set} clients 
 */
function handleClientConnection(ws, req, assetmanager, clients) {

  // Dictionary of available functions matching command types.
  const functionalities = {
    command: (data) => assetmanager.sendCommand(data),
    timedcommand: (data) => assetmanager.sendTimedCommand(data),
    removetimer: (data) => assetmanager.removeTimedCommand(data),
    remove: (data) => assetmanager.removeDevice(data),
    rename: (data) => assetmanager.renameDevice(data),
  };

  ws.on("message", async msg => {
    const data = JSON.parse(msg);
    
    const errMsg = verifyData(data);
    if (errMsg) {
      ws.send(JSON.stringify(errMsg));
      return;
    }

    const func = functionalities[data.type];
    const payload = data.payload;

    func(payload);
      
    sendDeviceUpdate(clients);
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected");
  });

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("error", () => {
    console.log("Error, Ws terminated.");
    ws.terminate();
    clients.delete(ws);
  });
}


/**
 * Send signal to fetch updated device list to every client.
 * @param {Set} clients Set of client websocket connections.
 */
function sendDeviceUpdate(clients) {
  const obj = {
    type: "deviceupdate",
  };
  clients.forEach(client => client.send(JSON.stringify(obj)));
}


/**
 * Verifies if received data is in correct format.
 * @param {Object} data 
 * @returns Object containing error state or null if all okay.
 */
function verifyData(data) {
  const payload = data.payload;
  const type = data.type;
  const device_id = payload?.id;

  let errorObj = null;

  if (!(device_id && type)) {
      errorObj = {
          type: "functionstate",
          payload: {
            state: "err"
          }
      };
  }
  return errorObj;
}

export { handleDeviceConnection, handleClientConnection };