//const WS_URL = "ws://192.168.100.44:3000/ws/iot";
const WS_URL = "ws://192.168.100.17:5000/ws/iot";
const sockets = [];
const devices = [];

function createFunction(code, name="", initialstate="off", allowtimer=true) {
    return {
        code: code,
        name: name,
        state: initialstate,
        initialstate: initialstate,
        allowtimer: allowtimer,
    };
}

function functionFactory(caseNro) {
    let functions = null;
    switch(caseNro) {
        case 0:
            functions = [createFunction(1, "brew coffee")];
            break;
        case 1:
            functions = [
                createFunction(1, "brew coffee"),
                createFunction(2, "do nothing", "on", false)
            ];
            break;
        default:
            functions = [];

    }
    return functions;
}

function execute(command) {
    const state = devices[0].functions[command - 1].state;
    devices[0].functions[command - 1].state = state === "off" ? "on" : "off";
    return devices[0].functions[command - 1].state;
}

//TODO: Make objects out of these so simulating devices can be better.
function newMockDevice(funcs) {
    const socket = new WebSocket(WS_URL);
    const functions = funcs;
    const device = {
        id: "mock_1",
        type: "coffeemaker",
        functions: functions,
    }
    
    socket.onopen = () => {
        console.log("Connected to server via ws");
        const obj = {
            type: "register",
            device_id: "mock_1",
            payload: {
                devicetype: "coffeemaker",
                functions: functions
            }
        };
        socket.send(JSON.stringify(obj));
    };
    
    socket.onmessage = msg => {
        const data = JSON.parse(msg.data);
        console.log("Message from server:", data);
        if (data.type === "command") {
            const state = execute(data.payload?.command);
            const obj = {
                type: "functionstate",
                device_id: "mock_1",
                func_code: data.payload?.command,
                payload: {
                    success: true,
                    state: state,
                }
            };
            socket.send(JSON.stringify(obj));
        }
        else if (data.type === "state") {
            const obj = {
                type: "functionstate",
                device_id: "mock_1",
                func_code: data.payload?.command,
                payload: {
                    success: true,
                    state: devices[0].functions[data.payload?.command - 1].state,
                }
            };
            socket.send(JSON.stringify(obj));
        } 
    };

    socket.onclose = () => {
        console.log("mock_1 disconnected");
    };

    sockets.push(socket);
    devices.push(device);
}

newMockDevice(functionFactory(1));
