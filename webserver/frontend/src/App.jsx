import './App.css';
import { useEffect } from 'react';
import { DeviceProvider } from './context/DeviceContext';
import { DeviceList } from './modules/DeviceList';

function App() {

  useEffect(() => {
    let ws;
    let retry;
    function connect() {
      const WS_URL = "ws://127.0.0.1:5000/ws/frontend";
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => console.log("Connected to WS server");

      ws.onmessage = msg => console.log("Message from server:", msg.data);

      ws.onclose = () => {
        console.log("WS closed, retrying...");
        retry = setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      clearTimeout(retry);
      ws?.close();
    }
  }, []);

  return (
    <DeviceProvider>
      <div className="App">
        <header className="App-header">
        </header>
        <DeviceList>
        </DeviceList>
      </div>
    </DeviceProvider>
  );
}

export default App;
