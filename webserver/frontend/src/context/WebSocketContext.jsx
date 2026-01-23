import { createContext, useState, useEffect } from 'react';

export const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
    const [ws, setWs] = useState(null);

    useEffect(() => {
    let retry;
    let socket;
    function connect() {
      const WS_URL = "ws://127.0.0.1:5000/ws/frontend";
      const socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        console.log("Connected to server via ws");
        setWs(socket);
      }

      socket.onmessage = msg => console.log("Message from server:", msg.data);

      socket.onclose = () => {
        console.log("WS closed, retrying...");
        if (ws) {
            setWs(null);
        }
        retry = setTimeout(connect, 2000);
      };

      socket.onerror = () => {
        if (ws) {
            setWs(null);
        }
        socket.close();
      };
    }

    connect();

    return () => {
      clearTimeout(retry);
      socket?.close();
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ws}}>
        {children}
    </WebSocketContext.Provider>
  );
}