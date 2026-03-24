import { useContext, useState } from 'react';
import './App.css';
import { DeviceProvider } from './context/DeviceContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeContext } from './context/ThemeContext';
import { DeviceList } from './modules/DeviceList';
import { Header } from './modules/Header';
import { Settings } from './modules/Settings';

function App() {
  const themeContext = useContext(ThemeContext);
  const [view, setView] = useState(0);
  const views = [<DeviceList/>, <Settings/>];

  return (
    <WebSocketProvider>
      <DeviceProvider>
        <div className="App">
          <Header setView={setView}/>
          {views[view]}
          <div className={themeContext.retro ? "scanlines" : ""}></div>
          <div className={themeContext.scan ? "scanline" : ""}></div>
        </div>
      </DeviceProvider>
    </WebSocketProvider>
  );
}

export default App;
