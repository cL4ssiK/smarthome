import { useState, Fragment } from "react";
import styles from "./deviceFunctionsForm.module.css";

function DeviceFunctionsForm({ device, toggleDeviceFunctionState}) {

  
  const handleClick = (value) => {

    fetch("api/turnon/", {
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
      .catch((err) => console.error("Error:", err));
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