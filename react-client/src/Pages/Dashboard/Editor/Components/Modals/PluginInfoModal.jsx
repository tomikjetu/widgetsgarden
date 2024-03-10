import { Button, ButtonDanger } from "../../../../../Elements/Buttons";
import { Modal } from "../../../../../Elements/Modals";

export function PluginInfoModal({ isOpenPluginMenuModal, setOpenPluginMenuModal, pluginMenuModalData, removePlugin }) {
  if (!pluginMenuModalData) return "";
  return (
    <Modal
      width={"80%"}
      maxWidth={"100%"}
      title={pluginMenuModalData.name}
      display={isOpenPluginMenuModal}
      setDisplay={setOpenPluginMenuModal}
      buttons={[
        <ButtonDanger
          onClick={() => {
            removePlugin(pluginMenuModalData.id);
          }}
        >
          Delete Plugin
        </ButtonDanger>,
        <Button
          onClick={() => {
            setOpenPluginMenuModal(false);
          }}
        >
          Close
        </Button>,
      ]}
    >
      <div
        style={{
          maxHeight: "50vh",
          overflowY: "auto",
          width: "100%",
        }}
      >
        <p>{pluginMenuModalData.description}</p>
        {pluginMenuModalData.functions.map((pluginfunction) => {
          return (
            <div
              style={{
                marginTop: "1rem",
              }}
              key={pluginfunction.id}
            >
              <span
                style={{
                  display: "flex",
                  gap: ".5rem",
                }}
              >
                <h3>{pluginfunction.name}</h3>
                <div className="element-tags">
                  {pluginfunction.elements == "*" && <span className="element-tag">All Elements</span>}
                  {typeof pluginfunction.elements == "object" &&
                    pluginfunction.elements.map((tag) => {
                      return (
                        <span key={Math.random()} className="element-tag">
                          {tag}
                        </span>
                      );
                    })}
                </div>
              </span>

              <p>{pluginfunction.description ?? "Undocumented"}</p>

              {pluginfunction.parameters &&
                pluginfunction.parameters.map((parameter) => {
                  return (
                    <div style={{ marginTop: ".7rem" }} key={parameter.id}>
                      <span
                        style={{
                          display: "flex",
                          gap: ".5rem",
                        }}
                      >
                        <h4>{parameter.title}</h4>
                        <span className="element-tag gray">{parameter.type}</span>
                      </span>
                      <p style={{ whiteSpace: "pre-wrap" }}>{parameter.description ?? "Undocumented"}</p>
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
