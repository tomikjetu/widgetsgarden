import { useEffect, useRef, useState } from "react";
import Style from "./Styles/Options.module.css";

export default function TextOptions({ id, defaultValue, options, onChange, dashboardStyle, fill }) {
  id = `textOptions-${id == null ? Math.floor(Math.random() * 10000) : id}`;

  // in case there are more dropdowns
  // changable width with js // remove from css

  const OptionsComponent = useRef(null);
  const DropdownOptions = useRef(null);
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState(defaultValue || options[0].value);

  useEffect(() => {
    window.addEventListener("click", (e) => {
      if (!OptionsComponent.current) return;
      var outside = !OptionsComponent.current.contains(e.target);
      if (outside) setOpen(false);
    });
  }, []);

  function openDropdown() {
    setOpen(!open);
    var posY = OptionsComponent.current.getBoundingClientRect().y;
    var height = window.innerHeight;
    DropdownOptions.current.classList.toggle(Style.top, height - 250 < posY);
  }

  function setValue(target) {
    let value = target.getAttribute("value");
    setTempValue(value);
    onChange(value);
  }

  function getText() {
    return options.filter((val) => val.value == tempValue)[0]?.text || options[0].text;
  }

  function getIcon() {
    return options.filter((val) => val.value == tempValue)[0]?.icon;
  }

  return (
    <div ref={OptionsComponent} onClick={openDropdown} className={`${Style.OptionsComponent} ${fill ? Style.Fill : ""} ${dashboardStyle ? Style.DashboardStyle : ""}`}>
      <div className={Style.Input}>
        {getIcon()}
        <p>{getText()}</p>
      </div>
      <div ref={DropdownOptions} style={{ display: open ? "block" : "none" }} className={Style.Options}>
        {options?.map((option) => {
          return (
            <div value={option.value} key={Math.random() * 999} className={Style.Option} onClick={(e) => setValue(e.target)}>
              {option.icon}
              {option.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
