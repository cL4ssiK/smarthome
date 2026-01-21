import { Coffeemaker } from "../devices/Coffeemaker.js";


function handleDeviceConnection(ws, req, devices) {
    ws.on("message", msg => {
        const data = JSON.parse(msg);

        if (data.device_id) {
          const device = new Coffeemaker(data.device_id, ws);
          devices.set(device.device_id, device);
          console.log("ESP registered:", data.device_id);
        }
        else if (data.payload.success){
          console.log("response: ", data.payload.success);
        }
        if (data.payload?.state){
          console.log("Function state: ", data.payload.state);
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
            const device = devices.find(device => device.device_id === device_id);
            device.send_command(command_code);
        }
    });

    ws.on("close", () => {
        clients.delete(ws);
        console.log("Client disconnected");
    });

    ws.on("pong", () => {
        console.log("pong");
        ws.isAlive = true;
    });

    ws.on("error", () => ws.terminate());
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