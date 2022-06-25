import React, { forwardRef, useRef } from "react";
import { FaCheck } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import ReactDOM, { createPortal } from "react-dom";

export const Modal = forwardRef(
  (
    {
      open,
      setOpen,
      children,
      className,
      onBackdropClick,
      clickThroughBackdrop,
      backdropClass,
      style,
      head,
      label,
    },
    ref
  ) => {
    const backdropRef = useRef();
    if (open) {
      return createPortal(
        <>
          <div
            data-testid="modal"
            className={`modalBackdrop ${backdropClass || ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onBackdropClick?.();
            }}
            style={clickThroughBackdrop ? { pointerEvents: "none" } : {}}
            ref={backdropRef}
          />
          <div
            style={{ ...style }}
            ref={ref}
            className={`modal ${className || ""} ${head ? "withHead" : ""}`}
          >
            {head && (
              <div className="head">
                {label}{" "}
                <button
                  className="btn clear"
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  <IoClose />
                </button>
              </div>
            )}
            {children}
          </div>
        </>,
        document.querySelector("#portal") || document.body
      );
    }
    return null;
  }
);

export const Prompt = ({ className, type, message, btns, callback }) => {
  const cleanup = () =>
    ReactDOM.render(<></>, document.querySelector("#prompt"));
  const confirm = () => {
    callback();
    cleanup();
  };
  const decline = () => {
    cleanup();
    ["information", "success", "error"].includes(type) &&
      callback &&
      callback();
  };
  if (type === "error") {
    // console.trace(message);
  }
  ReactDOM.render(
    <>
      <div className={`promptBackdrop`} />
      <div data-testid="prompt" className={`prompt ${className || ""}`}>
        <div className="content">
          <button className="clear close" onClick={decline}>
            <IoClose />
          </button>
          {type === "confirmation" && (
            <div className="label confirmation">
              <span className="svg">?</span>
              {
                // <span className="promptLabel">CONFIRMATION</span>
              }
            </div>
          )}
          {type === "information" && (
            <div className="label information">
              <span className="svg">i</span>
              {
                // <span className="promptLabel">INFORMATION</span>
              }
            </div>
          )}
          {type === "success" && (
            <div className="label success">
              <span className="svg">
                <FaCheck />
              </span>
              {
                // <span className="promptLabel">SUCCESS</span>
              }
            </div>
          )}
          {type === "error" && (
            <div className="label _error">
              <span className="svg">
                <IoClose />
              </span>
              {
                // <span className="promptLabel">ERROR</span>
              }
            </div>
          )}
          <p className="question">{message}</p>
          <div className="actions">
            {btns || (
              <>
                {type === "confirmation" ? (
                  <>
                    <button
                      className="no btn secondary wd-100"
                      onClick={decline}
                    >
                      No
                    </button>
                    <button
                      className="yes btn secondary wd-100"
                      onClick={confirm}
                    >
                      Yes
                    </button>
                  </>
                ) : (
                  <button
                    className="yes btn secondary wd-100"
                    onClick={decline}
                  >
                    Ok
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>,
    document.querySelector("#prompt") || document.createElement("div")
  );
};
