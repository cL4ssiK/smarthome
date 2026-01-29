import { createContext, useState, useEffect, useRef } from 'react';

export const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
    const ws = useRef(null);
    const [wsState, setWsState] = useState("disconnected");
    const [lastEvent, setLastEvent] = useState(0);

    useEffect(() => {
        let retry;
        let socket;
        function connect() {
            const WS_URL = "ws://192.168.100.17:5000/ws/frontend";
            const socket = new WebSocket(WS_URL);

            socket.onopen = () => {
                console.log("Connected to server via ws");
                ws.current = socket;
                setWsState("connected");
            }

            socket.onmessage = msg => {
                try {
                    const data = JSON.parse(msg.data);
                    console.log("Message from server:", data.type);
                    if (data.type === "deviceupdate"){
                        setLastEvent(id => id + 1);
                    }
                } catch(err) {
                    console.log("Error parsing JSON data.", err);
                }
            }

            socket.onclose = () => {
                console.log("WS closed, retrying...");
                if (ws) {
                    ws.current = null;
                }
                setWsState("disconnected");
                retry = setTimeout(connect, 2000);
            };

            socket.onerror = () => {
                if (ws) {
                    ws.current = null;
                }
                socket.close();
                setWsState("disconnected");
            };
        }

        connect();

        return () => {
            clearTimeout(retry);
            socket?.close();
        }
    }, []);

    const sendCommand = (device_id, code) => {
        const obj = {
            type: "command",
            payload: {
                id: device_id,
                code: code
            }
        };
        ws?.current.send(JSON.stringify(obj));
    };

    const removeDevice = (device_id) => {
        const obj = {
            type: "remove",
            payload: {
                id: device_id,
            }
        };
        ws?.current?.send(JSON.stringify(obj));
    };

  return (
    <WebSocketContext.Provider value={{ws, wsState, lastEvent, setWsState, sendCommand, removeDevice}}>
        {children}
    </WebSocketContext.Provider>
  );
}