import { Device } from "../devices/Device.js";


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
    }

    sendDeviceUpdate(clients);
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
            const device = devices.findById(device_id);
            device.send_command(command_code);
        }
        else if (data.type == "remove") {
          const payload = data.payload;
          const device_id = payload?.id;
          devices.remove(device_id);
          console.log("Device " + device_id + " removed");
          //sendDeviceUpdate(clients);
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


function sendDeviceUpdate(clients) {
  const obj = {
    type: "deviceupdate",
  };
  clients.forEach(client => client.send(JSON.stringify(obj)));
}

export { handleDeviceConnection, handleClientConnection };