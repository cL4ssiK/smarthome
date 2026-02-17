import { useContext, useEffect, useState } from "react";
import { WebSocketContext } from "../context/WebSocketContext";
import { DeviceContext } from "../context/DeviceContext";
import styles from "./FunctionDetails.module.css";

function FunctionDetails({ func, device }) {

    const wsContext = useContext(WebSocketContext);
    const deviceContext = useContext(DeviceContext);

    const [funcState, setfuncState] = useState(func.active);
    const [timerTime, setTimerTime] = useState("");
    const [timerErr, setTimerErr] = useState("");
    const [timerState, setTimerState] = useState("");

    const handleClick = (value) => {
        wsContext.sendCommand(device.id, value);
    };

    const handleTimerClick = () => {
        if (timerErr) return;
        if (timerTime === "") {
            setTimerErr("No time specified.");
            return;
        }
        
        const now = new Date();
        const currentTimeS = now.getHours()*60*60 + now.getMinutes()*60 + now.getSeconds();

        const [h, m] = timerTime.split(':').map(val => parseInt(val));
        const timerTimeS = h*60*60 + m*60;

        const timerInterval = timerTimeS - currentTimeS > 0 ? timerTimeS - currentTimeS : timerTimeS - currentTimeS + 24*60;

        console.log(timerInterval);
        console.log(`${timerState} timer set at: ${timerTime}`);

        wsContext.sendTimerEvent(device.id, func.code, timerState, timerTime, timerInterval);
    };

    const handleDeleteBtonClick = () => {
        wsContext.removeTimerEvent(device.id, func.code, timerState);
    }

    const validateTimer = (time) => {
        let errMsg = "";
        if (time === "") {
            setTimerErr("");
            return;
        }
        let [h, m] = time.split(':');
        h = parseInt(h);
        m = parseInt(m);
        if (isNaN(h) || isNaN(m)) errMsg = "Hour or minute is not a number.";
        else if (h < 0 || h > 23) errMsg = "Hour needs to be between 0 and 23.";
        else if (m < 0 || m > 59) errMsg = "Minute needs to be between 0 and 59.";
        else if (timerState !== "on" && timerState !== "off") errMsg = "Select state to time.";
        setTimerErr(errMsg);
    };

    //TODO: maybe only use the context, might be better way idk.
    useEffect(() => {
        const fs = deviceContext.getDeviceFunctionState(device.id, func.code);
        setfuncState(fs);
    }, [deviceContext]);

    useEffect(() => {
        validateTimer(timerTime);
    }, [timerTime, timerState]);

    // add timer
    return (
        <div>
            <h2>{func?.name}</h2>
            <button onClick={() => handleClick(func?.code)}>{funcState === "on" ? "Deactivate" : "Activate"}</button>
            {
                func.timer !== undefined &&
                <div>
                    <button onClick={() => handleTimerClick()}
                    >Set timer</button>
                    <input 
                        value={timerTime}
                        onChange={e => setTimerTime(e.target.value)}
                        placeholder="HH:MM"></input>
                    <p>{timerErr}</p>
                    <button
                        value={"on"}
                        onClick={e => setTimerState(e.target.value)}>Activate</button>
                    <button
                        value={"off"}
                        onClick={e => setTimerState(e.target.value)}>Deactivate</button>
                    {
                        func?.timer?.on?.eventId && 
                        <div>
                            <p>Activates at {func?.activateEventTriggerTime}</p>
                            <span className={styles.removeButton}
                                onClick={() => handleDeleteBtonClick()}>X</span>
                        </div>
                    }
                    {
                        func?.timer?.off?.eventId && 
                        <div>
                            <p>Deactivates at {func?.deactivateEventTriggerTime}</p>
                            <span className={styles.removeButton}
                                onClick={() => handleDeleteBtonClick()}>X</span>
                        </div>
                    }
                </div>
            }
        </div>
    );
}

export { FunctionDetails };