import styles from "./TextAndButton.module.css";

function TextAndButton({ as: Component='h3', symbol, text, value="", handleBtonClick}) {

    return (
        <div className={styles.firstRow}>
            <Component 
                className={styles.textElement}>
                {text}
            </Component>
            <div className={styles.rightSection}>
                {symbol && <span className={styles.removeButton}
                    data-value={value}
                    onClick={handleBtonClick}>{symbol}</span>
                }
            </div>
        </div>           
    );
}

function Text({ as: Component='h3', text }) {

    return (
        <div className={styles.firstRow}>
            <Component 
                className={styles.textElement}>
                {text}
            </Component>
        </div>           
    );
}

export { TextAndButton, Text };