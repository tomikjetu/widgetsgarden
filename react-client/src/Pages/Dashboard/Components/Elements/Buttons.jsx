import styles from "../../../../Styles/root/elements/Button.module.css";

export function ButtonDanger({ children, onClick }) {
    return (
       <Button className={styles.buttonDanger} onClick={onClick}>{children}</Button>
    );
}

export function Button({ children, className, onClick }) {
    return (
        <button
            className={`${styles.button} ${className || ""}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}