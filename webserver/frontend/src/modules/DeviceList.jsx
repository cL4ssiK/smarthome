import { useContext, useState, useEffect, Fragment } from "react";
import { DeviceContext } from "../context/DeviceContext";
//import { DeviceFunctionsForm } from "./deviceFunctionsForm";
import styles from "./DeviceList.module.css";

function DeviceList() {
    const devicesContext = useContext(DeviceContext);
    const [deviceFunctions, setDeviceFunctions] = useState([]);

    useEffect(() => {
        if (!devicesContext.devices) return;

        setDeviceFunctions(
            devicesContext.devices.map(device => ({ id: device.id, toggled: false }))
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
            {devicesContext.devices.map((device, i) => (
                <Fragment key={device.id}>
                    <div id={device.id}
                        className={styles.devicecard}
                        onClick={() => handleClick(device.id)}>
                        <h3>{device.name == "" ? "Device " + i : device.name}</h3>
                        <p>{device.active ? "on" : "off"}</p>
                    </div>
                    <div className={styles.devicecard}>
                        {deviceFunctions.find(elem => elem.id == device.id)?.toggled &&
                        <p>tähän devicefunctionformi aina</p>
                    }
                    </div>
                </Fragment>
            ))}
        </div>
    )
}

export { DeviceList };