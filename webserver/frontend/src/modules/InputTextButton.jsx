import { WebSocketContext } from "../context/WebSocketContext";
import styles from "./InputTextButton.module.css";
import { useContext, useState, useEffect, useRef } from "react";

function InputTextButton({ symbol, text, value="", handleBtonClick, device_id=""}) {
    
    const wsContext = useContext(WebSocketContext);

    const [active, setActive] = useState(false);
    const [inputValue, setInputValue] = useState(text);
    const inputRef = useRef(null);

    const handleUpdate = () => {
        if (inputValue.trim() !== "") {
          wsContext.renameDevice(device_id, inputValue);
        }
        setActive(false);
    };

    const handleKeyDown = (event) => {
        // Check if the pressed key is "Enter"
        if (event.key === 'Enter') {
            event.target.blur(); 
        }
    };

    useEffect(() => {
        if (active && inputRef.current) {
            inputRef.current.focus();
        }
    }, [active]);

    return (
        <div className={styles.firstRow}>
            {active ? 
            <input
                className={styles.input}
                type="text"
                value={inputValue}
                onChange={(e) => {
                    if (e.target.value.length <= 14)
                        setInputValue(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                onBlur={handleUpdate}
                onClick={e => e.stopPropagation()}
                size={inputValue.length > 0 ? inputValue.length : 1}
                ref={inputRef}
            ></input>: 
            <h3 
                className={styles.textElement}
                onClick={(e) => {
                    e.stopPropagation();
                    setActive(true);}}>
                {text}
            </h3>}
            <div className={styles.rightSection}>
                <span className={styles.removeButton}
                    data-value={value}
                    onClick={handleBtonClick}>{symbol}</span>
            </div>
        </div>           
    );
}

export { InputTextButton };