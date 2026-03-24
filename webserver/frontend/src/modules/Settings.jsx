import styles from "./Settings.module.css";
import { ThemeContext } from "../context/ThemeContext";
import { useContext, useState } from "react";

function Settings() {
    const themecontext = useContext(ThemeContext);
    const [activeTheme, setActiveTheme] = useState("");

    return (
        <div className={styles.settings}>
            <div>
                <h1>THEMES</h1>
                <ul>
                    {themecontext.getThemes().map((elem, index) => (
                        <li key={index} onClick={() => themecontext.toggleTheme(index)}>
                            <span className={`${styles.dot} ${elem.name === themecontext.theme.name ? styles.active : ""}`}></span>
                            {elem.display}
                        </li>
                    ))}
                </ul>
                <h1>MISC</h1>
                <ul>
                    <li key={123} onClick={() => themecontext.toggleRetro(!themecontext.retro)}>
                        <span className={`${styles.dot} ${themecontext.retro ? styles.active : ""}`}></span>
                        CRT MONITOR
                    </li>
                </ul>
            </div>
        </div>
    );
}

export { Settings };