import { Coffeemaker } from "../devices/Coffeemaker.js";


function handleDeviceConnection(ws, req, devices, clients) {
    /**
     * Message structure:
     * {
     *    type: "register",
     *    device_id: "xxx"
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
          const device = new Coffeemaker(data.device_id, ws);
          devices.set(device.device_id, device);
          console.log("ESP registered:", data.device_id);
          const obj = {
            type: "deviceupdate",
          };
          clients.forEach(client => client.send(JSON.stringify(obj)));
        }
        else if (data.type === "functionstate"){

          const device = devices.get(data.device_id);

          device.changeFunctionState(data.payload?.state, data.func_code);

          const obj = {
            type: "deviceupdate",
          };
          clients.forEach(client => client.send(JSON.stringify(obj)));
        }
    });

  ws.on("close", () => {
    for (const device in devices) {
      if (device.connection === ws) {
        devices.delete(device.device_id);
        console.log(device.device_id + " disconnected!");
        break;
      }
    }
    const obj = {
      type: "deviceupdate",
    };
    clients.forEach(client => client.send(JSON.stringify(obj)));
  });

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("error", () => {
    console.log("Error, Ws terminated.");
    ws.terminate();
    for (const device in devices) {
      if (device.connection === ws) {
        devices.delete(device.device_id);
        console.log(device.device_id + " disconnected!");
        break;
      }
    }
    const obj = {
      type: "deviceupdate",
    };
    clients.forEach(client => client.send(JSON.stringify(obj)));
  });
}


function handleClientConnection(ws, req, clients, devices) {
    ws.on("message", msg => {
        const data = JSON.parse(msg);
        if (data.type === "command") {
            const payload = data.payload;
            const device_id = payload?.id;
            const command_code = payload?.code;

            // in case of missing data, send error to client
            if (!(device_id && command_code)) {
                const object = {
                    type: "functionstate",
                    payload: {
                        state: "err"
                    }
                };
                ws.send(JSON.stringify(object));
            }

            // if all good, proceed to forwarding command code to device.
            const device = devices.get(device_id);
            device.send_command(command_code);
        }
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
 * Function to broadcast device updates to all clients.
 * @param {*} devices 
 * @param {*} clients 
 */
function broadcastDevices(devices, clients) {
  clients.forEach(ws => {
    ws.send(JSON.stringify({ type: "devices:update", devices }));
  });
}


export { handleDeviceConnection, handleClientConnection };