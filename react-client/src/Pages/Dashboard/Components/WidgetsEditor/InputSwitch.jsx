import { ArrayInput } from "./Components/ArrayInput.jsx";
import { ColorInput } from "./Components/ColorInput.jsx";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Switch from "./Components/Switch.jsx";
import dayjs from "dayjs";
import Options from "./Components/Options";

import InputStyle from "./Components/Styles/Input.module.css";
import { TimePicker } from "@mui/x-date-pickers";
import ImagePicker from "./Components/ImagePicker.jsx";
import { useState } from "react";

export default function InputSwitch({ type, value, setValue, preset }) {
  var [tempValue, setTempValue] = useState(value);

  function changeValue(value) {
    setValue(value);
    setTempValue(value);
  }

  switch (type) {
    case "text":
      return <input className={InputStyle.Input} defaultValue={tempValue || ""} onChange={(e) => changeValue(e.target.value)} />;
    case "text-multiline":
      return <textarea className={InputStyle.Input} defaultValue={tempValue || ""} onChange={(e) => changeValue(e.target.value)}></textarea>
    case "number":
      return <input className={InputStyle.Input} type="number" defaultValue={tempValue} onChange={(e) => changeValue(e.target.value)} />;
    case "range":
      return (
        <>
          <p>{tempValue}</p>
          {preset?.mouseUp && <input className={InputStyle.Input} type="range" min={preset.min} max={preset.max} defaultValue={tempValue} onMouseUp={(e) => changeValue(e.target.value)} />}
          {!preset?.mouseUp && <input className={InputStyle.Input} type="range" min={preset.min} max={preset.max} defaultValue={tempValue} onChange={(e) => changeValue(e.target.value)} />}
        </>
      );
    case "dropdown":
      return <Options defaultValue={tempValue || ""} onChange={(value) => changeValue(value)} options={preset.options} fill={true} />;
    // TODO String with options (provide options to choose but can choose their own)
    case "switch":
      return (
        <span
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {preset.off || "OFF"}
          <Switch defaultChecked={tempValue} onChange={(e) => changeValue(e.target.checked)} />
          {preset.on || "ON"}
        </span>
      );
    case "Array":
      return <ArrayInput value={tempValue || []} setValue={changeValue} />;
    case "color":
      return <ColorInput value={tempValue} setValue={changeValue} />;
    case "date":
      if (tempValue == 0) changeValue(new Date().valueOf());
      return (
        <DatePicker
          sx={{ "& input": { color: "white" }, "& svg": { fill: "white" }, "& fieldset": { borderColor: "rgba(255,255,255, 0.6)" }, "& .MuiInputBase-root:hover fieldset": { borderColor: "white" } }}
          value={dayjs(tempValue || new Date())}
          onChange={(newValue) => {
            changeValue(newValue.valueOf());
          }}
        />
      );
    case "time":
      if (tempValue == 0) changeValue(new Date().valueOf());
      return <TimePicker sx={{ "& input": { color: "white" }, "& svg": { fill: "white" }, "& fieldset": { borderColor: "rgba(255,255,255, 0.6)" }, "& .MuiInputBase-root:hover fieldset": { borderColor: "white" } }} value={dayjs(tempValue || new Date())} onChange={(newValue) => changeValue(newValue.valueOf())} />;
    case "image":
      return <ImagePicker value={tempValue} setValue={changeValue} />;
  }
}
