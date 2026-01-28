import { useContext } from "react";
import styles from "./deviceFunctionsForm.module.css";
import { WebSocketContext } from "../context/WebSocketContext";

function DeviceFunctionsForm({ device }) {

  const wsContext = useContext(WebSocketContext);
  
  const handleClick = (value) => {
    wsContext.sendCommand(device.id, value);
  };

  return (
        <div key={device.id}>
          {device.functions.map(func => {
            return (
            <div key={func.code} className={styles.functionRow}>
              <button onClick={() => handleClick(func.code)}>{func.name}</button>
              <span
                className={`${styles.statusDot} ${
                func.active == "on" ? styles.active : ( func.active == "off" ? styles.inactive : styles.error )}`}/>
            </div>
          );})}
        </div>
  );
}

export { DeviceFunctionsForm };