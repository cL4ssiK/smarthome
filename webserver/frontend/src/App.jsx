import { useContext, useState } from 'react';
import './App.css';
import { DeviceProvider } from './context/DeviceContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeContext } from './context/ThemeContext';
import { Devices } from './modules/Devices';
import { Header } from './modules/Header';
import { Settings } from './modules/Settings';
import { MainMenu } from './modules/MainMenu';
import { UserProvider } from './context/UserContext';
import { Groups } from './modules/Groups';

function App() {
  const themeContext = useContext(ThemeContext);
  const [view, setView] = useState(0);
  const views = [<MainMenu/>, <Devices/>, <Groups/>, <Settings/>];

  return (
    <WebSocketProvider>
      <UserProvider>
        <DeviceProvider>
          <div className="App">
            <Header setView={setView}/>
            {views[view]}
            <div className={themeContext.retro ? "scanlines" : ""}></div>
            <div className={themeContext.scan ? "scanline" : ""}></div>
          </div>
        </DeviceProvider>
      </UserProvider>
    </WebSocketProvider>
  );
}

export default App;
