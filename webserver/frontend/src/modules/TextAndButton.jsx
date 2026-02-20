import styles from "./TextAndButton.module.css";

function TextAndButton({ as: Component='h3', symbol, text, value="", handleBtonClick}) {

    return (
        <div className={styles.firstRow}>
            <Component className={styles.textElement}>{text}</Component>
            <div className={styles.rightSection}>
                <span className={styles.removeButton}
                    data-value={value}
                    onClick={handleBtonClick}>{symbol}</span>
            </div>
        </div>           
    );
}

export { TextAndButton };