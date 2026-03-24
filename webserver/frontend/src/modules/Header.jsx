import styles from "./Header.module.css";

function Header({ setView }) {
    return (
        <div className={styles.btonContainer}>
            <p onClick={() => setView(0)}>DEVICES</p>
            <p onClick={() => setView(1)}>SETTINGS</p>
        </div>
    );
}

export { Header };