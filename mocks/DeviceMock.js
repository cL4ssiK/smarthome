const WS_URL = "ws://192.168.100.17:5000/ws/iot";
const sockets = [];

function newMockDevice() {
    const socket = new WebSocket(WS_URL);
    const functions = [{ code:1, name: "Ei tee mitään" },{ code:2, name: "Ei tee myöskään mitään" }];
    
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
    };

    socket.onclose = () => {
        console.log("mock_1 disconnected");
    };

    sockets.push(socket);
}

newMockDevice();
