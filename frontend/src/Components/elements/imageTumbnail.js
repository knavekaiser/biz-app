import { useState, useEffect } from "react";
import { Modal } from "../modal";
import { FaTimes } from "react-icons/fa";
import s from "./elements.module.scss";

export function Images({ images, className }) {
  const [imgs, setImgs] = useState([]);
  const [open, setOpen] = useState(false);
  const [mainView, setMainView] = useState();
  useEffect(() => {
    const _imgs = [];
    if (Array.isArray(images)) {
      _imgs.push(...images);
    } else if (images) {
      setImgs(images);
    }
    setImgs(_imgs.filter((img) => typeof img === "string"));
  }, [images]);
  useEffect(() => {
    if (imgs.length) {
      setMainView(imgs[0]);
    }
  }, [imgs]);

  return (
    <>
      <div
        className={`${s.imageTumbnail} ${className || ""} ${
          imgs.length > 1 ? s.multiple : ""
        }`}
      >
        {mainView && (
          <img
            src={process.env.REACT_APP_PUBLIC_R2_URL + mainView}
            onClick={() => setOpen(true)}
          />
        )}
      </div>
      <Modal
        open={open}
        setOpen={setOpen}
        className={s.imageViewModal}
        backdropClass={s.imageViewModalBackdrop}
        onBackdropClick={() => setOpen(false)}
      >
        <button
          className={`btn clear ${s.closeBtn}`}
          onClick={() => setOpen(false)}
        >
          <FaTimes />
        </button>
        <img
          className={s.mainImg}
          src={process.env.REACT_APP_PUBLIC_R2_URL + mainView}
        />
        <div className={s.thumbnails}>
          {imgs.map((src, i) => (
            <img
              src={process.env.REACT_APP_PUBLIC_R2_URL + src}
              key={i}
              onClick={() => setMainView(src)}
              className={src === mainView ? s.selected : ""}
            />
          ))}
        </div>
      </Modal>
    </>
  );
}
