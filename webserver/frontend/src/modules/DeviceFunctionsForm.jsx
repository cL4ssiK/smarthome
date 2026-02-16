import { useContext, useState } from "react";
import styles from "./deviceFunctionsForm.module.css";
import { WebSocketContext } from "../context/WebSocketContext";
import { FunctionDetails } from "./FunctionDetails";

function DeviceFunctionsForm({ device }) {

  const wsContext = useContext(WebSocketContext);

  const [activeFunction, setActiveFunction] = useState(null);
  
  const handleClick = (func) => {
    setActiveFunction(func);
  };

  const handleReturnBtonClick = () => {
    setActiveFunction(null);
  };

  return (
        <div key={device.id}>
          {
            activeFunction ?
            (<div>
              <span className={styles.removeButton}
                onClick={() => handleReturnBtonClick()}>X</span>
              <FunctionDetails
                device={device}
                func={activeFunction}>
              </FunctionDetails>
            </div>) : 
            (device.functions.map(func => {
              return (
              <div key={func.code} className={styles.functionRow}>
                <button onClick={() => handleClick(func)}>{func.name}</button>
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