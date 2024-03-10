import styles from "../../../../Styles/root/elements/Modal.module.css";
import { BinIcon } from "../../../../Styles/Svg";
import { Button, ButtonDanger } from "./Buttons";

export function ModalDelete({ height, width, maxWidth, children, display, setDisplay, title, onClose, onDelete }) {
  return (
    <Modal title={`Delete ${title}`} height={height} width={width} maxWidth={maxWidth} display={display} setDisplay={setDisplay} buttons={[<Button onClick={onClose}>Close</Button>, <ButtonDanger onClick={onDelete}>Delete</ButtonDanger>]} icon={<BinIcon />}>
      {children}
    </Modal>
  );
}

export function Modal({ height, width, maxWidth, children, className, display, setDisplay, title, buttons, icon }) {
  return (
    <div
      style={{
        display: display ? "flex" : "none",
      }}
      className={`${styles.modal} ${className || ""}`}
    >
      <div
        className={styles.content}
        style={{
          height: height || "auto",
          width: width || "auto",
        }}
      >
        <div className={styles.container}>
          {icon && <div className={styles.icon}>{icon}</div>}
          <div
            className={styles.body}
            style={{
              maxWidth,
            }}
          >
            <div className={styles.title}>
              <h2>{title}</h2>
            </div>
            {children}
          </div>
        </div>

        <div className={styles.actionButtons}>
          {buttons?.map((BTN, index) => {
            return <div key={index}>{BTN}</div>;
          })}
          {!buttons && <Button onClick={() => setDisplay(false)}>Close</Button>}
        </div>
      </div>
    </div>
  );
}
