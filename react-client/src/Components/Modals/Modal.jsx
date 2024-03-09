export default function Modal({ height, width, maxWidth, children, className, display, setDisplay }) {
  return (
    <div
      style={{
        display: display ? "flex" : "none",
      }}
      className={`modal ${className || ""}`}
    >
      <div
        className="modalContent"
        style={{
          height: height || "auto",
          width: width || "auto",
          maxWidth
        }}
      >
        {children}
      </div>
    </div>
  );
}
