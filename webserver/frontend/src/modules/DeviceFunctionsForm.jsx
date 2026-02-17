import { useContext, useState } from "react";
import styles from "./deviceFunctionsForm.module.css";
import { WebSocketContext } from "../context/WebSocketContext";
import { FunctionDetails } from "./FunctionDetails";

function DeviceFunctionsForm({ device }) {

  const wsContext = useContext(WebSocketContext);

  const [activeFunctionCode, setActiveFunctionCode] = useState(null);
  
  const handleClick = (code) => {
    setActiveFunctionCode(code);
  };

  const handleReturnBtonClick = () => {
    setActiveFunctionCode(null);
  };

  return (
        <div key={device.id}>
          {
            activeFunctionCode ?
            (<div>
              <span className={styles.removeButton}
                onClick={() => handleReturnBtonClick()}>X</span>
              <FunctionDetails
                device={device}
                func={device?.functions?.find(func => func.code === activeFunctionCode)}>
              </FunctionDetails>
            </div>) : 
            (device.functions.map(func => {
              return (
              <div key={func.code} className={styles.functionRow}>
                <button onClick={() => handleClick(func.code)}>{func.name}</button>
                <span
                  className={`${styles.statusDot} ${
                  func.active == "on" ? styles.active : ( func.active == "off" ? styles.inactive : styles.error )}`}/>
              </div>
            );}))
          }
        </div>
  );
}

export { DeviceFunctionsForm };