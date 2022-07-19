import { useRef, useState, useEffect, useLayoutEffect } from "react";
import Sortable from "sortablejs";
import s from "./elements.module.scss";
import { FaSortDown, FaCircleNotch } from "react-icons/fa";
import { BsFillGearFill } from "react-icons/bs";
import { Modal } from "../modal";

export const Table = ({
  columns,
  className,
  theadTrStyle,
  children,
  sortable,
  actions,
  loading,
}) => {
  const tbody = useRef();
  const table = useRef();
  const [style, setStyle] = useState({});
  useEffect(() => {
    if (sortable) {
      Sortable.create(tbody.current, {
        animation: 250,
        easing: "ease-in-out",
        removeCloneOnHide: true,
        ...sortable,
      });
    }
  }, []);
  return (
    <table
      ref={table}
      className={`${s.table} ${className || ""} ${actions ? s.actions : ""}`}
      cellPadding={0}
      cellSpacing={0}
    >
      {columns && (
        <thead>
          <tr style={{ ...theadTrStyle }}>
            {columns.map((column, i) => (
              <th
                key={i}
                className={`${column.action ? s.action : ""} ${
                  column.className || ""
                }`}
                style={{ ...column.style }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody ref={tbody}>
        {loading ? (
          <tr className={s.loading}>
            <td>
              <span className={s.icon}>
                <FaCircleNotch />
              </span>
            </td>
          </tr>
        ) : (
          children
        )}
      </tbody>
    </table>
  );
};

export const TableActions = ({ actions, className }) => {
  const btn = useRef();
  const popupContainerRef = useRef();
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  useLayoutEffect(() => {
    if (actions.length > 3) {
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
                .clientHeight || 35) *
                actions.length +
                8)
          ),
          8
        ),
        // width: width,
        // height: 28 * actions.length,
        maxHeight: window.innerHeight - 16,
      });
    }
  }, [open]);
  return actions.length < 4 ? (
    <td
      className={`${s.tableActions} ${className || ""}`}
      data-testid="tableActions"
    >
      {actions.map((action, i) => (
        <button
          key={i}
          title={action.label}
          className="clear"
          onClick={action.callBack}
          type="button"
        >
          {action.icon}
        </button>
      ))}
    </td>
  ) : (
    <td className={`${s.tableActions} ${className || ""}`}>
      <button
        className={s.btn}
        ref={btn}
        data-testid="gear-btn"
        onClick={() => setOpen(true)}
        type="button"
      >
        <BsFillGearFill className={s.gear} /> <FaSortDown className={s.sort} />
      </button>
      <Modal
        style={style}
        className={s.actionModal}
        open={open}
        onBackdropClick={() => setOpen(false)}
        backdropClass={s.actionBackdrop}
      >
        <div ref={popupContainerRef}>
          {actions.map((action, i) => (
            <button
              key={i}
              title={action.label}
              className="clear"
              onClick={() => {
                setOpen(false);
                action.callBack();
              }}
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>
      </Modal>
    </td>
  );
};

export const VirtualTable = ({
  loading,
  className,
  columns,
  onScroll,
  rows,
  getRowHeight,
  rowHeight,
  rowRenderer,
  actions,
}) => {
  const [scrollPos, setScrollPos] = useState(0);
  const [totalHeight, setTotalHeight] = useState(0);
  const tbodyRef = useRef();
  useEffect(() => {
    setTotalHeight(
      getRowHeight
        ? rows.reduce((p, c) => p + getRowHeight(c), 0)
        : (rowHeight || 0) * rows.length
    );
  }, [rows]);
  return (
    <table
      className={`${s.table} ${s.virtual} ${className || ""} ${
        actions ? s.actions : ""
      }`}
      cellSpacing={0}
      cellPadding={0}
      onScroll={(e) => {
        setScrollPos(e.target.scrollTop);
      }}
      style={{
        maxHeight: "60vh",
      }}
      ref={tbodyRef}
    >
      <thead>
        <tr>
          {columns.map((item, i) => {
            return (
              <th
                key={i}
                className={item.className || ""}
                onClick={item.onClick}
              >
                {item.label}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody
        style={{
          height: totalHeight,
          maxHeight: totalHeight,
        }}
      >
        {loading ? (
          <tr className={s.loading}>
            <td>
              <span className={s.icon}>
                <FaCircleNotch />
              </span>
              Loading...
            </td>
          </tr>
        ) : (
          rows.map((row, i, arr) => {
            const buffer = 10;
            const containerHeight = tbodyRef.current.clientHeight;
            const theadHeight = tbodyRef.current.querySelector("thead")
              .clientHeight;
            const x =
              (getRowHeight
                ? arr.slice(0, i).reduce((p, a) => p + getRowHeight(a), 0)
                : rowHeight * i) + theadHeight;
            const currentRowHeight = getRowHeight
              ? getRowHeight(row)
              : rowHeight;

            if (
              x + currentRowHeight > scrollPos &&
              x < scrollPos + containerHeight
            ) {
              return rowRenderer(row, {
                position: "absolute",
                top: x,
                height: rowHeight,
                background: i % 2 == 0 ? "#ffffff" : "#f3f3f3",
              });
            }
            return null;
          })
        )}
      </tbody>
    </table>
  );
};
