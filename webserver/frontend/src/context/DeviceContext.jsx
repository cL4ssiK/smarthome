import { createContext, useState, useEffect, useContext } from 'react';
import { WebSocketContext } from './WebSocketContext';

export const DeviceContext = createContext(null);

/**
 * Validates devices that server send for errors. If device is malformed, removes it from frontend
 *  so users do not cause problems by using broken devices.
 * @param {Array} data 
 * @returns array of functional devices
 */
export const validateDevices = (data) => {
    const devices = [];
    // if data is not array, return.
    if (!Array.isArray(data)) {
        console.log("Data is not in array form.", data);
        return devices;
    }
    data.forEach(device => {
        // Check if fields exist and datatypes match.
        if(!(typeof device.id === "string" && 
                typeof device.name === "string" && 
                    Array.isArray(device.functions) &&
                        typeof device.active === "boolean") 
        ) {
            return;
        }
        const functions = [];
        // Check if fields exist and datatypes match for functions.
        device.functions.forEach(func => {
            if(!(Number.isInteger(func.code) && 
                    typeof func.name === "string" && 
                        typeof func.active === "string") 
            ) {
                return;
            }
            // If function state is something else than some of the predetermined, put state to error.
            if(func.active !== "on" || func.active !== "off" || func.active !== "err") {
                func.active = "err";
            }
            functions.push(func);
        });
        devices.push({...device, functions});
    });
    return devices;
};

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
          const validatedData = validateDevices(data);
          setDevices(validatedData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
    };

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