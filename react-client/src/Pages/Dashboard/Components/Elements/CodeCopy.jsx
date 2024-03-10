import Highlight from "react-highlight";

import { toast } from "react-toastify";

import "../../../../Styles/root/highlight.css";
import { CopyIcon } from "../../../../Styles/Svg";

export default function CodeCopy({ code, fit }) {
  function Copy() {
    navigator.clipboard.writeText(code);
    toast.success("Copied to clipboard");
  }

  return (
    <div style={{
      width: fit ? "fit-content" : ""
    }} className="copyable-code-wrapper">
      <div className="copyable-code">
        <Highlight className="language-html">{code}</Highlight>
        <button className="copy" onClick={Copy}>
          <CopyIcon />
        </button>
      </div>
    </div>
  );
}
