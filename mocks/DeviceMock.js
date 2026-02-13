//const WS_URL = "ws://192.168.100.44:3000/ws/iot";
const WS_URL = "ws://192.168.100.17:5000/ws/iot";
const sockets = [];

function createFunction(code, name="", initialstate="off", allowtimer=true) {
    return {
        code: code,
        name: name,
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

//TODO: Make objects out of these so simulating devices can be better.
function newMockDevice(funcs) {
    const socket = new WebSocket(WS_URL);
    const functions = funcs;
    
    socket.onopen = () => {
        console.log("Connected to server via ws");
        const obj = {
            type: "register",
            device_id: "mock_1",
            payload: {
                functions: functions
            }
        };
        socket.send(JSON.stringify(obj));
    };
    
    socket.onmessage = msg => {
        const data = JSON.parse(msg.data);
        console.log("Message from server:", data);
        if (data.type === "command") {
            const obj = {
                type: "functionstate",
                device_id: "mock_1",
                func_code: data.payload?.command,
                payload: {
                    success: true,
                    state: "on",
                }
            };
            socket.send(JSON.stringify(obj));
        } 
    };

    socket.onclose = () => {
        console.log("mock_1 disconnected");
    };

    sockets.push(socket);
}

newMockDevice(functionFactory(1));
