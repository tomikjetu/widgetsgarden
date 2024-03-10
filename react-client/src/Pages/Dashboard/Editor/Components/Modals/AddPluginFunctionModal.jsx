import { Button } from "../../../../../Elements/Buttons";
import { Modal } from "../../../../../Elements/Modals";
import { InfoIcon } from "../../../../../Styles/Svg";

// TODO
// ADD CATEGORIES

export function AddPluginFunctionModal({ isOpenAddPluginFunctionModal, setOpenAddPluginFunctionModal, setOpenPluginsModal, filteredPluginFunctions, checkLock, selectedElement, addPluginFunctionToSelectedElement, openPluginMenu }) {
  return (
    <Modal
      title={"Add Plugin Function"}
      display={isOpenAddPluginFunctionModal}
      setDisplay={setOpenAddPluginFunctionModal}
      buttons={[
        <Button
          onClick={() => {
            setOpenAddPluginFunctionModal(false);
            setOpenPluginsModal(true);
          }}
        >
          Install more plugins
        </Button>,
        <Button
          onClick={() => {
            setOpenAddPluginFunctionModal(false);
          }}
        >
          Close
        </Button>,
      ]}
    >
      <div
        className="buttons"
        style={{
          width: "100%",
          display: "flex",
          flexDirection: 'column', 
          gap: "0 1rem",
          margin: "2rem 0 1rem 0",
          maxHeight: "300px",
          overflowY: "auto",
          overflowX: "hidden"
        }}
      >
        {filteredPluginFunctions.map((pluginfunction) => {
          console.log(pluginfunction);
          return (
            <div key={pluginfunction.name} style={{ marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
              <p
                style={{
                  whiteSpace: 'nowrap',
                  cursor: checkLock(selectedElement?.locked, pluginfunction.lock) ? "not-allowed" : "pointer",
                  color: checkLock(selectedElement?.locked, pluginfunction.lock) ? "#888" : "#fff",
                }}
                onClick={() => {
                  if (checkLock(selectedElement?.locked, pluginfunction.lock)) return;
                  addPluginFunctionToSelectedElement(pluginfunction);
                }}
              >
                {pluginfunction.name}
              </p>
              <span
                style={{
                  cursor: "pointer",
                  width: "16px",
                  height: "16px",
                }}
                onClick={() => {
                  setOpenAddPluginFunctionModal(false);
                  openPluginMenu(pluginfunction.plugin);
                }}
              >
                <InfoIcon />
              </span>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
