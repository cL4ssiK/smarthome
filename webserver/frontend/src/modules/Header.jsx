import { useState } from "react";
import styles from "./Header.module.css";

function Header({ setView }) {
    const [active, setActive] = useState(0);

    return (
        <ul className={styles.btonContainer}>
            <li className={active === 0 ? styles.active : ""} 
                onClick={() => {
                    setView(0);
                    setActive(0);
                }}>DEVICES</li>
            <li className={active === 1 ? styles.active : ""} 
                onClick={() => {
                    setView(1);
                    setActive(1);
                }}>SETTINGS</li>
        </ul>
    );
}

export { Header };