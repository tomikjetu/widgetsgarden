import { useEffect, useRef, useState } from "react";

import ArrayStyle from "./Styles/ArrayInput.module.css";
import { BinIcon } from "../../../../../Styles/Svg";

export function ArrayInput({ value, setValue }) {
  var [isNew, setIsNew] = useState(false);
  var [tempValues, setTempValues] = useState(value);

  useEffect(() => {
    if (isNew) {
      ValueInputs.current[tempValues.length - 1].focus();
      setIsNew(false);
    }
    setValue(tempValues);
  }, [tempValues]);

  var newValueInput = useRef(null);
  var ValueInputs = useRef([]);

  function updateValue(index, editVal) {
    var editingTempValues = [...tempValues];
    editingTempValues[index].value = editVal;
    setTempValues(editingTempValues);
  }

  function deleteValue(index) {
    setTempValues(tempValues.filter((val, i) => i != index));
  }

  function newEntry() {
    setIsNew(true);
    var entry = {
      id: "a" + Date.now().toString(36),
      value: newValueInput.current.value,
    };
    setTempValues([...tempValues, entry]);
    newValueInput.current.value = "";
  }

  return (
    <div>
      <div className={ArrayStyle.Elements}>
        {tempValues.map((entry, index) => {
          return (
            <div className={ArrayStyle.Element} key={entry.id}>
              <input className={ArrayStyle.Input} ref={(el) => (ValueInputs.current[index] = el)} defaultValue={entry.value} onBlur={(e) => updateValue(index, e.target.value)} />
              <button className={ArrayStyle.Button} onClick={() => deleteValue(index)}>
                <BinIcon />
              </button>
            </div>
          );
        })}
      </div>
      <input className={`${ArrayStyle.Input} ${ArrayStyle.New}`} ref={newValueInput} onKeyUp={newEntry} placeholder="Start typing" />
    </div>
  );
}
