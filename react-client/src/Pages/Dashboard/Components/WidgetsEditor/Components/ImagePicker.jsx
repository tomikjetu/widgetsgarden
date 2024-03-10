import { useEffect, useState } from "react";
import {Modal} from "../../../../../Elements/Modals";
import { BinIcon, UploadIcon } from "../../../../../Styles/Svg";
import styles from "./Styles/ImagePicker.module.css";

export default function ImagePicker({ value, setValue }) {
  var [isModalOpen, setModalOpen] = useState(false);

  // TODO FILE DRAG ON WHOLE MODAL
  // TODO more folders
  // USER FOLDER
  // LIBRARY FOLDER defined in the widgets database

  var [tabOpen, setTabOpen] = useState(0);

  function editImage() {
    setModalOpen(true);
  }

  var [assets, setAssets] = useState([]);
  useEffect(() => {
    getAssets();
    document.getElementById("image-file").addEventListener("change", imageUploaded);
  }, []);

  function uploadImage() {
    document.getElementById("image-file").click();
  }

  async function getAssets() {
    var response = await fetch(`${process.env.REACT_APP_SERVER_URL}/assets`, {
      method: "GET",
      credentials: "include",
    });
    var data = await response.json();
    setAssets(data);
  }

  async function removeAsset(assetId) {
    await fetch(`${process.env.REACT_APP_SERVER_URL}/assets/${assetId}`, {
      method: "DELETE",
      credentials: "include",
    });
    await getAssets();
  }

  async function imageUploaded() {
    var photo = document.getElementById("image-file").files[0];
    let formData = new FormData();

    formData.append("asset", photo);

    // Couldn't send formData with axios
    await fetch(`${process.env.REACT_APP_SERVER_URL}/assets`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    getAssets();
  }

  return (
    <>
      <Modal height="auto" width="70%" className="changeimage-modal" display={isModalOpen} setDisplay={setModalOpen}>
        <div className={styles.Header}>
          <h3>Images</h3>
          {tabOpen == 0 && (
            <span onClick={uploadImage} className={styles.Upload}>
              <UploadIcon />
              <input accept="image/*" id="image-file" type="file" />
            </span>
          )}
        </div>

        <div className={styles.tabs}>
          <div className={`${styles.tab} ${tabOpen == 0 ? styles.selected : ""}`} onClick={() => setTabOpen(0)}>
            Your Images
          </div>
          <div className={`${styles.tab} ${tabOpen == 1 ? styles.selected : ""}`} onClick={() => setTabOpen(1)}>
            Library
          </div>
        </div>

        {tabOpen == 0 && (
          <div className={styles.Images}>
            {Object.keys(assets).length > 0 &&
              assets.user.map((asset) => {
                return (
                  <div
                    className={styles.Image}
                    onClick={() => {
                      setValue(`${process.env.REACT_APP_SERVER_URL}/assets/image/${asset.assetId}`);
                      setModalOpen(false);
                    }}
                    key={asset.assetId}
                  >
                    <span className={styles.Remove} onClick={() => removeAsset(asset.assetId)}>
                      <BinIcon />
                    </span>
                    <img src={`${process.env.REACT_APP_SERVER_URL}/assets/thumbnail/${asset.assetId}`} />
                    <p>{asset.name}</p>
                  </div>
                );
              })}
            {Object.keys(assets).length > 0 && assets.user.length == 0 && <p>Upload your first image</p>}
          </div>
        )}

        {tabOpen == 1 && (
          <div className={styles.Images}>
            {Object.keys(assets).length > 0 &&
              assets.library.map((asset) => {
                return (
                  <div
                    className={styles.Image}
                    onClick={() => {
                      setValue(`${process.env.REACT_APP_SERVER_URL}/assets/library/${asset.assetId}`);
                      setModalOpen(false);
                    }}
                    key={asset.assetId}
                  >
                    <img src={`${process.env.REACT_APP_SERVER_URL}/assets/library/${asset.assetId}`} />
                    <p>{asset.name}</p>
                  </div>
                );
              })}
          </div>
        )}

        <button className="btn" onClick={() => setModalOpen(false)}>
          Cancel
        </button>
      </Modal>

      <div className={styles.PickerPreview} onClick={editImage}>
          <img src={value || "/missing-image.png"}></img>
        <p>Change Image</p>
      </div>
    </>
  );
}
