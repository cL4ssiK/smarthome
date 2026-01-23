import './App.css';
import { DeviceProvider } from './context/DeviceContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { DeviceList } from './modules/DeviceList';

function App() {

  return (
    <DeviceProvider>
      <WebSocketProvider>
        <div className="App">
          <header className="App-header">
          </header>
          <DeviceList>
          </DeviceList>
        </div>
      </WebSocketProvider>
    </DeviceProvider>
  );
}

export default App;
