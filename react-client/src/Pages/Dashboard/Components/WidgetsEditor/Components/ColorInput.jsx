import { SketchPicker } from "react-color";
import { useEffect, useState } from "react";
export function ColorInput({ value, setValue }) {
  var [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setValue(tempValue);
  }, [tempValue]);

  return (
    <>
      <SketchPicker
        width="fill-available"
        color={tempValue}
        onChange={(e) => {
          setTempValue(`rgba(${e.rgb.r}, ${e.rgb.g}, ${e.rgb.b}, ${e.rgb.a})`);
        }}
      />
    </>
  );
}
