import { CopyIcon } from "../Styles/Svg";
import Highlight from "react-highlight";


import "../Styles/root/highlight.css";

export default function CodeCopy({code}) {
  return (
    <div className="copyable-code-wrapper">
      <div className="copyable-code">
        <Highlight className="language-html">{code}</Highlight>
        <button className="copy" onClick={() => navigator.clipboard.writeText(code)}>
          <CopyIcon />
        </button>
      </div>
    </div>
  );
}
