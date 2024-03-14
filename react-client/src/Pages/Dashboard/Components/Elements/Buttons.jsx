import styles from "../../../../Styles/root/elements/Button.module.css";

export function ButtonDanger({ children, onClick }) {
  return (
    <Button className={styles.buttonDanger} onClick={onClick}>
      {children}
    </Button>
  );
}

export function Button({ children, className, onClick, style, background }) {
  return (
    <button
      style={{
        ...style,
        backgroundColor: background,
      }}
      className={`${styles.button} ${className || ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
