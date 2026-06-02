import { useContext, useState, useEffect } from "react";
import { DeviceContext} from "../context/DeviceContext";
import { WebSocketContext } from "../context/WebSocketContext";
import { DeviceFunctionsForm } from "./deviceFunctionsForm";
import { InputTextButton } from "./InputTextButton";
import styles from "./DeviceList.module.css";
import { ReactComponent as CoffeemakerIMG } from "../images/coffeemakerFallout4.svg";

function DeviceList({group}) {
    const {devices, loading} = useContext(DeviceContext);
    const wsContext = useContext(WebSocketContext);

    const [deviceFunctions, setDeviceFunctions] = useState([]);

    const icons = {
        coffeemaker: CoffeemakerIMG,
    };
    const iconStyles = {
        coffeemaker: styles.coffeemakerIMG,
    };

    useEffect(() => {
        if (!devices[group]) return;

        setDeviceFunctions(prevDeviceFunctions => 
            devices[group]?.map(device => {
                const prevToggleState = prevDeviceFunctions?.find(f => f.id == device.id);
                return { 
                    id: device.id, 
                    toggled: prevToggleState && device?.active ? prevToggleState.toggled : false 
                };
            })
        );
    }, [devices[group]]);

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

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            {devices[group]?.map((device, i) => (
                <div key={device.id}
                    className={styles.deviceDiv}>
                    <div id={device.id}
                        data-testid="device-card-testdevice1" 
                        className={`${styles.commonBox} 
                        ${deviceFunctions.find(elem => elem.id == device.id)?.toggled ? 
                            styles.deviceCardfuncOn : styles.deviceCardfuncOff}`}
                        onClick={device.active ? () => handleClick(device.id) : undefined}>
                        <InputTextButton
                            symbol="X"
                            text={device.name == "" ? (device.type ? device.type.toUpperCase() : "Device " + (i + 1)) : device.name.toUpperCase()}
                            handleBtonClick={() => handleRemoveBtonClick(device.id)}
                            device_id={device.id}
                        ></InputTextButton>
                        {(() => {
                            const Icon = icons[device.type];
                            return <Icon className={iconStyles[device.type]} />;
                        })()}
                        <p>{device.active ? "CONNECTED" : "DISCONNECTED"}</p>
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