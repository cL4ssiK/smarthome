import { useContext } from "react";
import styles from "./deviceFunctionsForm.module.css";
import { WebSocketContext } from "../context/WebSocketContext";

function DeviceFunctionsForm({ device }) {

  const wsContext = useContext(WebSocketContext);
  
  const handleClick = (value) => {

    /**fetch("api/turnon/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "code": value,
        "id": device.id
      }),
    })
      .then((res) => res.text())
      .then((data) => {
        console.log("Server response:", data)
        toggleDeviceFunctionState(device.id, value, "on"); //requires real time updates to make correctly.
      })
      .catch((err) => console.error("Error:", err));*/
      wsContext.sendCommand(device.id, value);
  };

  return (
        <div key={device.id}>
          {device.functions.map(func => (
            <div key={func.code} className={styles.functionRow}>
              <button onClick={() => handleClick(func.code)}>{func.name}</button>
              <span
                className={`${styles.statusDot} ${
                func.active == "on" ? styles.active : ( func.active == "off" ? styles.inactive : styles.error )}`}/>
            </div>
          ))}
        </div>
  );
}

export { DeviceFunctionsForm };