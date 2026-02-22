import { useContext, useEffect, useState } from "react";
import { WebSocketContext } from "../context/WebSocketContext";
import { DeviceContext } from "../context/DeviceContext";
import { TimeRoller } from "./TimeRoller.jsx";
import { TextAndButton } from "./TextAndButton.jsx";
import styles from "./FunctionDetails.module.css";

function FunctionDetails({ func, device, handleReturnBtonClick }) {

    const wsContext = useContext(WebSocketContext);
    const deviceContext = useContext(DeviceContext);

    const [funcState, setfuncState] = useState(func.active);
    const [timerHour, setTimerHour] = useState("");
    const [timerMinute, setTimerMinute] = useState("");
    const [timerErr, setTimerErr] = useState("");

    const hours = Array.from({ length: 24 }, (_, i) => 
        i.toString().padStart(2, '0')
    ); 
    const minutes = Array.from({ length: 60 }, (_, i) => 
        i.toString().padStart(2, '0')
    );

    const handleClick = (value) => {
        wsContext.sendCommand(device.id, value);
    };

    const handleTimerClick = (type) => {
        if (timerErr) return;
        if (timerHour === "" || timerMinute === "") {
            setTimerErr("No time specified.");
            return;
        }
        
        const now = new Date();
        const currentTimeS = now.getHours()*60*60 + now.getMinutes()*60 + now.getSeconds();

        const h = parseInt(timerHour);
        const m = parseInt(timerMinute);

        const timerTimeS = h*60*60 + m*60;

        const timerInterval = ((timerTimeS - currentTimeS) > 0) ? timerTimeS - currentTimeS : timerTimeS - currentTimeS + 24*60*60;

        console.log("hello???", timerInterval);
        console.log(`${type} timer set at: ${timerHour}:${timerMinute}`);

        wsContext.sendTimerEvent(device.id, func.code, type, `${timerHour}:${timerMinute}`, timerInterval);
    };

    const handleDeleteBtonClick = (type) => {
        wsContext.removeTimerEvent(device.id, func.code, type);
    }

    //TODO: maybe only use the context, might be better way idk.
    useEffect(() => {
        const fs = deviceContext.getDeviceFunctionState(device.id, func.code);
        setfuncState(fs);
    }, [deviceContext]);

    // add timer
    return (
        <div className={styles.frame}>
            <TextAndButton 
                symbol="↩"
                text={func?.name.toUpperCase()}
                handleBtonClick={() => handleReturnBtonClick()}
            ></TextAndButton>
            <button className={func.active == "on" ? styles.active : ""}
                onClick={() => handleClick(func?.code)}>{funcState === "on" ? "DEACTIVATE" : "ACTIVATE"}</button>
            {
                func.timer !== undefined &&
                <div className={styles.timer}>
                    <div className={styles.timerollerDiv}>
                        <TimeRoller
                            options={hours}
                            onSelect={setTimerHour}>
                        </TimeRoller>
                        <span>:</span>
                        <TimeRoller
                            options={minutes}
                            onSelect={setTimerMinute}>
                        </TimeRoller>
                    </div>
                    {
                        timerErr && <p>{timerErr}</p>
                    }
                    <div className={styles.timerButtonsDiv}>
                        <button
                            value={"on"}
                            onClick={e => handleTimerClick(e.target.value)}>ACTIVATE</button>
                        <button
                            value={"off"}
                            onClick={e => handleTimerClick(e.target.value)}>DEACTIVATE</button>
                    </div>
                    {
                        func?.timer?.on?.eventId && 
                        <TextAndButton 
                            as="p"
                            symbol="X"
                            text={`Activates at ${func?.timer?.on?.eventTriggerTime}`}
                            value="on"
                            handleBtonClick={e => handleDeleteBtonClick(e.target.dataset.value)}
                        ></TextAndButton>
                    }
                    {
                        func?.timer?.off?.eventId && 
                        <TextAndButton 
                            as="p"
                            symbol="X"
                            text={`Deactivates at ${func?.timer?.off?.eventTriggerTime}`}
                            value="off"
                            handleBtonClick={e => handleDeleteBtonClick(e.target.dataset.value)}
                        ></TextAndButton>
                    }
                </div>
            }
        </div>
    );
}

export { FunctionDetails };