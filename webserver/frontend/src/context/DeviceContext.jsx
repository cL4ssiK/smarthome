import { createContext, useState } from 'react';

export const DeviceContext = createContext(null);

export function DeviceProvider({ children }) {

  /**
   * Devices are type:
   * {
   *    id: "xxxx",
   *    name: "coffeemaker",
   *    functions: [{name: "turn on", code: "1", active: "true/false},]
   *    active: "true/false",
   *    
   * }
   */
    const [devices, setDevices] = useState([]);

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

    const toggleDeviceFunctionState = (id, code) => {
        setDevices(prevDevices => 
            prevDevices.map(device =>
                device.id === id ? { ...device, functions: device.functions.map(func => 
                    func.code === code ? {...func, active: !func.active} : func
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
    <DeviceContext.Provider value={{ devices, addDevice, removeDevice, toggleDeviceState, toggleDeviceFunctionState, changeDeviceName }}>
      {children}
    </DeviceContext.Provider>
  );
}