import { useContext, useState, useEffect, Fragment } from "react";
import { DeviceContext} from "../context/DeviceContext";
import { WebSocketContext } from "../context/WebSocketContext";
import { DeviceFunctionsForm } from "./deviceFunctionsForm";
import styles from "./DeviceList.module.css";

function DeviceList() {
    const devicesContext = useContext(DeviceContext);
    const wsContext = useContext(WebSocketContext);

    const [deviceFunctions, setDeviceFunctions] = useState([]);

    const [selectedFunction, setSelectedFunction] = useState(null);

    useEffect(() => {
        if (!devicesContext.devices) return;

        setDeviceFunctions(prevDeviceFunctions => 
            devicesContext.devices?.map(device => {
                const prevToggleState = prevDeviceFunctions?.find(f => f.id == device.id);
                return { 
                    id: device.id, 
                    toggled: prevToggleState? prevToggleState.toggled : false 
                };
            })
        );
    }, [devicesContext.devices]);

    function changeDevFuncVisibility(id){
        setDeviceFunctions(prevDevices => prevDevices.map(device =>
            device.id == id ? {...device, toggled: !device.toggled} : device
        ));
    }

    function handleClick(id){
        changeDevFuncVisibility(id);
    }

    function handleRemoveBtonClick(id){
        wsContext.removeDevice(id);
    }

    if (devicesContext.loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            {devicesContext.devices?.map((device, i) => (
                <div key={device.id}
                    className={styles.deviceDiv}>
                    <div id={device.id}
                        data-testid="device-card-testdevice1" 
                        className={`${styles.commonBox} 
                        ${deviceFunctions.find(elem => elem.id == device.id)?.toggled ? 
                            styles.deviceCardfuncOn : styles.deviceCardfuncOff}`}
                        onClick={device.active ? () => handleClick(device.id) : undefined}>
                        <span className={styles.removeButton}
                                onClick={() => handleRemoveBtonClick(device.id)}>X</span>
                        <h3>{device.name == "" ? "Device " + i : device.name}</h3>
                        <p>{device.active ? "on" : "off"}</p>
                    </div>
                    <div className={`${styles.commonBox} 
                        ${deviceFunctions.find(elem => elem.id == device.id)?.toggled ? styles.functionlistOn : styles.functionlistOff}`}>
                        {deviceFunctions.find(elem => elem.id == device.id)?.toggled &&
                        <DeviceFunctionsForm 
                        device={device} 
                        ></DeviceFunctionsForm>
                    }
                    </div>
                </div>
            ))}
        </div>
    )
}

export { DeviceList };