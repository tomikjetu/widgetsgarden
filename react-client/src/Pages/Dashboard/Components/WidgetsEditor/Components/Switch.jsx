import Style from "./Styles/Switch.module.css";
export default function Switch({ id, defaultChecked, onChange }) {
  id = `switch-${id == null ? Math.floor(Math.random() * 10000) : id}`;
  return (
    <label className={Style.label} htmlFor={id}>
      <input className={Style.input} type="checkbox" name="" id={id} defaultChecked={defaultChecked} onChange={onChange} />
      <span className={Style.control}></span>
    </label>
  );
}
