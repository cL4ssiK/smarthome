import { createContext, useState, useEffect, useRef } from 'react';

export const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
    const ws = useRef(null);
    const [wsState, setWsState] = useState("disconnected");

    useEffect(() => {
        let retry;
        let socket;
        function connect() {
            const WS_URL = "ws://127.0.0.1:5000/ws/frontend";
            const socket = new WebSocket(WS_URL);

            socket.onopen = () => {
                console.log("Connected to server via ws");
                ws.current = socket;
                setWsState("connected");
            }

            socket.onmessage = msg => {
                console.log("Message from server:", msg.data);
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



  return (
    <WebSocketContext.Provider value={{ws, wsState, setWsState}}>
        {children}
    </WebSocketContext.Provider>
  );
}