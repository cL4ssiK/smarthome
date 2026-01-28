import { useContext, useState, useEffect, Fragment } from "react";
import { DeviceContext} from "../context/DeviceContext";
import { DeviceFunctionsForm } from "./deviceFunctionsForm";
import styles from "./DeviceList.module.css";

function DeviceList() {
    const devicesContext = useContext(DeviceContext);
    const [deviceFunctions, setDeviceFunctions] = useState([]);

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

    if (devicesContext.loading) {
        return <p>Loading...</p>;
    }

    return (
        <div >
            {devicesContext.devices?.map((device, i) => (
                <Fragment key={device.id}>
                    <div id={device.id}
                        data-testid="device-card-testdevice1" 
                        className={`${styles.commonBox} 
                        ${deviceFunctions.find(elem => elem.id == device.id)?.toggled ? 
                            styles.deviceCardfuncOn : ""}`}
                        onClick={device.active ? () => handleClick(device.id) : undefined}>
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
                </Fragment>
            ))}
        </div>
    )
}

export { DeviceList };