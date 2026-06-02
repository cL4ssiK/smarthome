import { useState } from "react";
import styles from "./Header.module.css";

function Header({ setView, headings }) {
    const [active, setActive] = useState(0);

    return (
        <ul className={styles.btonContainer}>
            {
                headings.map((elem, index) => (
                    <li key={index}
                        className={active === index ? styles.active : ""} 
                        onClick={() => {
                        setView(index);
                        setActive(index);
                    }}>{elem}</li>
                ))
            }
        </ul>
    );
}

export { Header };