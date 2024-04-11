import { Modal } from "../../../Components/Elements/Modals";
export default function InstallPluginModal({ isOpenPluginsModal, setOpenPluginsModal, PLUGINS, addPlugin }) {
  return (
    <Modal title={"Install Plugin"} width={'70vw'} maxWidth={'none'} display={isOpenPluginsModal} setDisplay={setOpenPluginsModal}>
      <div
        className="buttons"
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: "1rem",
          marginTop: "2rem",
          maxHeight: "300px",
          overflowY: "auto",
        }}
      >
        {PLUGINS &&
          PLUGINS.map((plugin) => {
            return (
              <div
                style={{
                  cursor: "pointer",
                  textAlign: "center",
                  width: "100px",
                }}
                key={plugin.id}
                onClick={() => {
                  addPlugin(plugin.id);
                }}
              >
                <img
                  style={{
                    width: "100px",
                    borderRadius: "4px",
                    marginBottom: "7px",
                  }}
                  src={`${process.env.REACT_APP_SERVER_URL}/assets/library/plugin/${plugin.id}`}
                  alt="Plugin Thumbnail"
                />
                <p>{plugin.name}</p>
              </div>
            );
          })}
      </div>
    </Modal>
  );
}
