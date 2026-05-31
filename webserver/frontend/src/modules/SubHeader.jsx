import { useState } from "react";
import styles from "./SubHeader.module.css";

function SubHeader({ setView, elements }) {
    const [active, setActive] = useState(0);

    return (
        <ul className={styles.btonContainer}>
            {
                elements.map((elem, index) => {
                    return (
                    <li key={"bton"+index}
                        className={active === 0 ? styles.active : ""} 
                        onClick={() => {
                            setView(index);
                            setActive(index);
                    }}>{elem}</li>);
                })
            }
        </ul>
    );
}

export { SubHeader };