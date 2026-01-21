import { useContext } from "react";
import { DeviceContext } from "../context/DeviceContext";
import styles from "./DeviceList.module.css";

function DeviceList() {
    const devicesContext = useContext(DeviceContext);

    if (devicesContext.loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            {devicesContext.devices.map((device, i) => (
                <div key={device.id} className={styles.devicecard}>
                    <h3>{device.name == "" ? "Device " + i : device.name}</h3>
                    <p>{device.active ? "on" : "off"}</p>
                </div>
            ))}
        </div>
    )
}

export { DeviceList };