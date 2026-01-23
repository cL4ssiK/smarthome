import { createContext, useState, useEffect, useContext } from 'react';
import { WebSocketContext } from './WebSocketContext';

export const DeviceContext = createContext(null);

export function DeviceProvider({ children }) {

    const { lastEvent } = useContext(WebSocketContext);

  /**
   * Devices are of type:
   * {
   *    id: "xxxx",
   *    name: "coffeemaker",
   *    functions: [{name: "turn on", code: "1", active: "on/off/err"},]
   *    active: "true/false",
   *    
   * }
   */
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDevices = async () => {
        try {
          const res = await fetch('/api/devices'); // replace with your endpoint
          if (!res.ok) throw new Error('Failed to fetch devices');
          const data = await res.json();
          console.log("devices", data);
          setDevices(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    useEffect(() => {
        fetchDevices();
    }, [lastEvent]);

    const addDevice = (device) => {
        setDevices(prevDevices => [...prevDevices, device]);
    };

    const removeDevice = (id) => {
        setDevices(prevDevices => prevDevices.filter(device => device.id !== id));
    };

    const toggleDeviceState = (id) => {
        setDevices(prevDevices => 
            prevDevices.map(device => 
                device.id === id ? { ...device, active: !device.active} : device
            )
        );
    };

    const toggleDeviceFunctionState = (id, code, state) => {
        setDevices(prevDevices => 
            prevDevices.map(device =>
                device.id === id ? { ...device, functions: device.functions.map(func => 
                    func.code === code ? {...func, active: state} : func
                )} : device
            )
        );
    };

    const changeDeviceName = (id, newName) => {
        setDevices(prevDevices => 
            prevDevices.map(device => 
                device.id === id ? { ...device, name: newName} : device
            )
        );
    }

  return (
    <DeviceContext.Provider value={{ devices, loading, error, addDevice, removeDevice, toggleDeviceState, toggleDeviceFunctionState, changeDeviceName }}>
      {children}
    </DeviceContext.Provider>
  );
}