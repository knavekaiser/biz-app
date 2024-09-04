import { Modal } from "Components/modal";
import s from "./menu.module.scss";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { useLayoutEffect, useRef, useState } from "react";

export default function Menu({ className, options }) {
  const btn = useRef();
  const popupContainerRef = useRef();
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  useLayoutEffect(() => {
    if (options.length === 0) {
      return;
    }
    const { width, height, x, y } = btn.current.getBoundingClientRect();
    const top = window.innerHeight - y;
    setStyle({
      position: "absolute",
      right: window.innerWidth - (x + width),
      top: Math.max(
        Math.min(
          y + height,
          window.innerHeight -
            ((popupContainerRef.current?.querySelector("button")
              ?.clientHeight || 35) *
              options.length +
              8)
        ),
        8
      ),
      // width: width,
      // height: 28 * actions.length,
      maxHeight: window.innerHeight - 16,
    });
  }, [open]);

  return (
    <>
      <button
        title="Actions"
        ref={btn}
        data-testid="gear-btn"
        onClick={() => setOpen(true)}
        type="button"
        className={`${s.menuBtn} ${className || ""} btn clear`}
      >
        <BiDotsVerticalRounded className={s.gear} />
      </button>
      <Modal
        style={style}
        className={s.actionModal}
        open={open}
        setOpen={setOpen}
        onBackdropClick={() => setOpen(false)}
        backdropClass={s.actionBackdrop}
      >
        <div ref={popupContainerRef}>
          {options.map((action, i) => (
            <button
              autoFocus={i === 0}
              key={i}
              tabIndex={i + 1}
              title={action.label}
              className="clear"
              onClick={() => {
                setOpen(false);
                action.onClick();
              }}
              disabled={action.disabled}
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
