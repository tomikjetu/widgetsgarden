import CodeCopy from "../../../../../Elements/CodeCopy";
import { Modal } from "../../../../../Elements/Modals";
import { EmbedIcon } from "../../../../../Styles/Svg";

export function EmbedModal({ embedId, codeEmbedModal, setCodeEmbedModal }) {
  return (
    <Modal width={"fit-content"} icon={<EmbedIcon />} maxWidth={"80vw"} title={"Embed code"} setDisplay={setCodeEmbedModal} display={codeEmbedModal}>
      <p>
        <span>Get your access code</span>
        <a href="/dashboard/access" style={{ textDecoration: "underline", marginLeft: "5px" }}>
          here
        </a>
        <span>.</span>
      </p>
      <CodeCopy fit code={`<div class="widgetsgarden" widgetId="${embedId}"></div>`} />
    </Modal>
  );
}
