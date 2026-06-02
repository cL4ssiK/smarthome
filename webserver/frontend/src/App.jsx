import { useContext, useEffect, useState } from 'react';
import './App.css';
import { DeviceProvider } from './context/DeviceContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeContext } from './context/ThemeContext';
import { Devices } from './modules/Devices';
import { Header } from './modules/Header';
import { Settings } from './modules/Settings';
import { MainMenu } from './modules/MainMenu';
import { UserContext, UserProvider } from './context/UserContext';
import { Groups } from './modules/Groups';

function App() {
  const themeContext = useContext(ThemeContext);
  const { user } = useContext(UserContext);
  const [view, setView] = useState(0);

  //TODO: More elegant solution.
  const logged = [<MainMenu/>, <Devices/>, <Groups/>, <Settings/>];
  const loggedHeadings = ["menu", "devices", "groups", "settings"];
  const notLogged = [<MainMenu/>, <Settings/>];
  const notLoggedHeadings = ["menu", "settings"];
  const [views, setViews] = useState(notLogged);

  useEffect(() => {
    if (user) setViews(logged);
    else setViews(notLogged);
  }, [user]);

  return (
    <WebSocketProvider>
      <DeviceProvider>
        <div className="App">
          <Header setView={setView} headings={user ? loggedHeadings : notLoggedHeadings}/>
          {views[view]}
          <div className={themeContext.retro ? "scanlines" : ""}></div>
          <div className={themeContext.scan ? "scanline" : ""}></div>
        </div>
      </DeviceProvider>
    </WebSocketProvider>
  );
}

export default App;
