import './App.css';
import { DeviceProvider } from './context/DeviceContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { DeviceList } from './modules/DeviceList';

function App() {

  return (
    <WebSocketProvider>
      <DeviceProvider>
        <div className="App">
          <header className="App-header">
            <h1>YOUR DEVICES</h1>
          </header>
          <DeviceList>
          </DeviceList>
        </div>
      </DeviceProvider>
    </WebSocketProvider>
  );
}

export default App;
