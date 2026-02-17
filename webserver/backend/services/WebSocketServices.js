import { Device } from "../devices/Device.js";
import { Devices } from "../devices/Devices.js";

/**
 * Handles websocket communication between server and IoT device.
 * @param {WebSocket} ws 
 * @param {Object} req 
 * @param {Devices} devices 
 * @param {Set} clients 
 */
function handleDeviceConnection(ws, req, devices, clients) {
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
    ws.on("message", msg => {
        const data = JSON.parse(msg);

        if (data.type === "register") {
          const device = new Device(data.device_id, data?.payload?.functions);
          device.connect(ws);
          data?.payload?.functions.forEach(func => device.changeFunctionState(func.initialstate, func.code));

          devices.add(device);
          console.log("ESP registered:", data.device_id);

          sendDeviceUpdate(clients);
        }
        else if (data.type === "functionstate"){

          const device = devices.findById(data.device_id);

          device.changeFunctionState(data.payload?.state, data.func_code);
          
          sendDeviceUpdate(clients);
        }
    });

  ws.on("close", () => {
    const device = devices.findByConnection(ws);

    if(device) {
      device?.disconnect();
      console.log(device.device_id + " disconnected!");
      sendDeviceUpdate(clients);
    }

  });

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("error", () => {
    console.log("Error, Ws terminated.");
    ws.terminate();
    const device = devices.findByConnection(ws);
    
    device.disconnect();
    console.log(device.device_id + " disconnected!");
    sendDeviceUpdate(clients);
  });
}


/**
 * "Dictionary" of available functions matching command types.
 */
const functionalities = {
        command: handleCommand,
        timedcommand: handleTimedCommand,
        removetimer: handleRemoveTimer,
        remove: handleRemoveDevice,
      };


//TODO: fix the issue that deviceupdate is only sent if state changes on timed call.
/**
 * Handles websocket communication between server and client.
 * @param {WebSocket} ws 
 * @param {Object} req 
 * @param {Set} clients 
 * @param {Devices} devices 
 */
function handleClientConnection(ws, req, clients, devices) {
    ws.on("message", msg => {
      const data = JSON.parse(msg);
      
      const errMsg = verifyData(data);
      if (errMsg) {
        ws.send(JSON.stringify(errMsg));
        return;
      }

      const func = functionalities[data.type];
      const payload = data.payload;
      const device = devices.findById(data.payload.id);
      //Hacky fix for device removal. Refactor later?
      func == handleRemoveDevice ? func(devices, payload) : func(device, payload);
      
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


/**
 * Handles forwarding basic command to device.
 * @param {Device} device 
 * @param {Object} payload 
 */
function handleCommand(device, payload) {
  const command_code = payload?.code;
  device.send_command(command_code);
}


/**
 * Handles setting up timer for command.
 * @param {Device} device 
 * @param {Object} payload 
 */
function handleTimedCommand(device, payload) {
  const command_code = payload?.code;
  const time = payload?.time;
  const timeS = payload?.timeS;
  const type = payload?.type;

  //TODO: backend validation
  device.set_timer(command_code, time, timeS, type);
}


/**
 * Handles cancelling set timer.
 * @param {Device} device 
 * @param {Object} payload 
 */
function handleRemoveTimer(device, payload) {
  device.remove_timer(payload.code, payload.type);
}


/**
 * Handles removal of device from server memory.
 * @param {Devices} devices 
 * @param {Object} payload 
 */
function handleRemoveDevice(devices, payload) {
  const device_id = payload?.id;
  devices.remove(device_id);
  console.log("Device " + device_id + " removed");
}

export { handleDeviceConnection, handleClientConnection };