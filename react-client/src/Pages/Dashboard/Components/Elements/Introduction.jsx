import { useEffect, useState } from "react";
import introductionStyles from "../../../../Styles/Dashboard/guide.module.css";
import Confetti from "react-confetti";
import { Button } from "./Buttons";

function Checkbox({ link, checked, label, id }) {
  return (
    <label htmlFor={`introduction-${id}`} className={introductionStyles.item}>
      <input checked={checked[id]} readOnly type="checkbox" id={`introduction-${id}`} className="hidden" />
      <label htmlFor={`introduction-${id}`} className={introductionStyles.cbx}>
        <svg width="14px" height="12px" viewBox="0 0 14 12">
          <polyline points="1 7.6 5 11 13 1"></polyline>
        </svg>
      </label>
      <label htmlFor={`introduction-${id}`} className={introductionStyles["cbx-lbl"]}>
        <a href={link}>{label}</a>
      </label>
    </label>
  );
}

export function IntroductionBlock() {
  var [visible, setVisible] = useState(true);

  function finish() {
    setVisible(false);
  }

  function skip() {
    setVisible(false);
  }

  var [values, setValues] = useState([true, true, true]);
  var [isChecked, setChecked] = useState([false, false, false]);
  var [isFinished, setFinished] = useState(false);
  useEffect(() => {
    isChecked.forEach((c, i) => {
      setTimeout(() => {
        var v = values[i];
        setChecked([...values.slice(0, i), v, ...isChecked.slice(i + 1)]);
      }, (i + 1) * 1000);
    });
    setTimeout(() => {
      if (values.every((v) => v)) {
        setFinished(true);
      }
    }, values.length * 1000);
  }, []);

  if (!visible) return "";
  return (
    <div className="dashboard-container" style={{ minHeight: "200px" }}>
      <div className={introductionStyles.introduction}>
        {isFinished && (
          <Confetti
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        )}
        <h3 className="bold">Let's get started</h3>
        <div className={introductionStyles.items}>
          <Checkbox checked={isChecked} link="/dashboard/widgets" label={"Create or Import your first widget"} id={0} />
          <Checkbox checked={isChecked} link="/dashboard/access" label={"Setup your website"} id={1} />
          <Checkbox checked={isChecked} link="/dashboard/analytics" label={"Enable Analytics"} id={2} />
        </div>
        {/*  confetti effect on clicked Finish*/}
        {!isFinished && (
          <Button onClick={skip} background={"#a0998e"}>
            Skip Introduction
          </Button>
        )}
        {isFinished && (
          <Button onClick={finish} background={"#daad60"}>
            Finish
          </Button>
        )}
      </div>
    </div>
  );
}
