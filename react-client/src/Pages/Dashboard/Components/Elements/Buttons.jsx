import styles from "../../../../Styles/root/elements/Button.module.css";

export function ButtonDanger({ children, onClick }) {
  return (
    <Button className={styles.buttonDanger} onClick={onClick}>
      {children}
    </Button>
  );
}

export function Button({ children, className, onClick, style, background,foreground, shadow }) {
  return (
    <button
      style={{
        ...style,
        backgroundColor: background,
        color: foreground,
        textShadow: shadow ? "var(--dashboard-shadow)" : "none",
      }}
      className={`${styles.button} ${className || ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
