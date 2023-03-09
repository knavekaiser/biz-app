import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useContext,
} from "react";
import Sortable from "sortablejs";
import s from "./elements.module.scss";
import { FaSortDown, FaCircleNotch } from "react-icons/fa";
import { Moment } from "./moment";
import { Images, FileInputNew } from "Components/elements";
import { BsFillGearFill } from "react-icons/bs";
import { useForm } from "react-hook-form";
import { useFetch, useYup } from "hooks";
import { toCSV, parseXLSXtoJSON } from "helpers";
import * as yup from "yup";
import { Modal, Prompt } from "../modal";
import { SiteContext } from "SiteContext";

export const Table = ({
  columns,
  className,
  theadTrStyle,
  children,
  sortable,
  actions,
  loading,
  placeholder,
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
        ) : children?.length > 0 ? (
          <>
            {children}
            {children.flat().filter((item) => item).length === 1 &&
              children[0]?.props?.className?.includes("inlineForm") && (
                <tr className={s.placeholder}>
                  <td>{placeholder || "Nothing yet..."}</td>
                </tr>
              )}
          </>
        ) : (
          <tr className={s.placeholder}>
            <td>{placeholder || "Nothing yet..."}</td>
          </tr>
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

export const DynamicTable = ({
  fields = [],
  data = [],
  loading,
  actions,
  className = "",
}) => {
  const { config } = useContext(SiteContext);
  return (
    <Table
      loading={loading}
      className={className}
      columns={[
        ...(fields.map((field) => ({ label: field.label })) || []),
        ...(actions ? [{ label: "Action" }] : []),
      ]}
    >
      {data.map((item, i) => (
        <tr key={i}>
          {fields.map((field, j) => {
            if (field.dataType === "boolean") {
              return (
                <td key={j}>
                  {field.options?.find(
                    (opt) =>
                      opt.value.toString() === item[field.name]?.toString()
                  )?.label ||
                    (item[field.name] === true && "True") ||
                    (item[field.name] === false && "False")}
                </td>
              );
            }
            if (
              field.dataType === "objectId" &&
              typeof item[field.name] === "object"
            ) {
              // console.log(item, field)
            }
            if (field.dataType === "object" && item[field.name]) {
              return (
                <td key={j}>
                  {Object.keys(item[field.name]).length} Properties
                </td>
              );
            }
            if (
              field.dataType === "objectId" &&
              field.collection &&
              item[field.name]
            ) {
              return (
                <td key={j} className="ellipsis l-1">
                  {item[field.name][field.optionLabel]}
                </td>
              );
            }
            if (field.inputType === "date") {
              return (
                <td key={j} className="ellipsis l-1">
                  <Moment format={"DD-MM-YYYY"}>{item[field.name]}</Moment>
                </td>
              );
            }
            if (
              ["image", "images", "picture", "photo", "img"].includes(
                field.name
              )
            ) {
              return (
                <td key={j}>
                  <Images images={item[field.name]} />
                </td>
              );
            }
            if (
              Array.isArray(item[field.name]) &&
              field.dataElementType === "object"
            ) {
              return (
                <td key={j} className="ellipsis l-1">
                  {item[field.name].length} Items
                </td>
              );
            }
            if (Array.isArray(item[field.name])) {
              const values = item[field.name];
              return (
                <td key={j} className="ellipsis l-1">
                  <div className="manyItems">
                    <span className="value">{values[0]}</span>

                    {values.length > 1 && (
                      <span className="icon">
                        +{values.length - 1}
                        <div className="allItems">
                          {values.map((u, i) =>
                            i === 0 ? null : <p key={u}>{values[i]}</p>
                          )}
                        </div>
                      </span>
                    )}
                  </div>
                </td>
              );
            }
            if (field.dataType === "number") {
              return (
                <td key={j} className="ellipsis l-1">
                  {item[field.name]
                    ? item[field.name].toLocaleString(config.numberSeparator)
                    : item[field.name]}
                </td>
              );
            }
            return (
              <td key={j} className="ellipsis l-1">
                {item[field.name]}
              </td>
            );
          })}
          <TableActions actions={actions(item)} />
        </tr>
      ))}
    </Table>
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
            const theadHeight =
              tbodyRef.current.querySelector("thead").clientHeight;
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

export const ImportExport = ({ importUrl, exportUrl }) => {
  const [importOpen, setImportOpen] = useState(false);
  return (
    <div className="flex gap-1">
      {importUrl && (
        <>
          <button className="btn m-a mr-0" onClick={() => setImportOpen(true)}>
            Import Data
          </button>
          <Modal
            open={importOpen}
            head
            label="Import Data"
            setOpen={setImportOpen}
          >
            <ImportForm
              url={importUrl}
              onSuccess={() => {
                setImportOpen(false);
              }}
            />
          </Modal>
        </>
      )}
      {exportUrl && <Export url={exportUrl} />}
    </div>
  );
};

const ImportForm = ({ url, onSuccess }) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: useYup(
      yup.object({
        file: yup.mixed().required(),
      })
    ),
  });

  const { post: postData, loading } = useFetch(url);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        parseXLSXtoJSON(values.file[0], (data) => {
          postData({ data })
            .then(({ data }) => {
              if (data?.message) {
                Prompt({
                  type: data.success ? "success" : "error",
                  message: data.message,
                });
              }
              if (data?.success) {
                onSuccess();
              }
            })
            .catch((err) =>
              Prompt({
                type: "error",
                message: err.message,
              })
            );
        });
      })}
      className={s.importData}
    >
      <FileInputNew
        label="File"
        name="file"
        control={control}
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        formOptions={{ required: true }}
      />
      <div className="flex mt-1 justify-end">
        <button className="btn" type="submit" disabled={loading}>
          Submit
        </button>
      </div>
    </form>
  );
};

const Export = ({ url }) => {
  const [data, setData] = useState(null);
  const { get: getData, loading } = useFetch(url);
  const fetchData = useCallback(() => {
    getData()
      .then(({ data }) => {
        if (data?.success) {
          if (!data.data.length) {
            return Prompt({ type: "error", message: "There are no data" });
          }
          const keys = Object.keys(data.data[0]).filter((key) => key !== "__V");
          const rawCSV = toCSV(
            keys,
            data.data.map((data) => keys.map((key) => data[key]))
          );

          const link = encodeURI(rawCSV);

          const a = document.createElement("a");
          a.setAttribute("id", "export-user-link");
          a.setAttribute("href", link);
          a.setAttribute("download", "data.csv");
          document.body.appendChild(a);
          a.click();
          document.querySelector("#export-user-link").remove();
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, [url]);
  return (
    <button disabled={loading} className="btn" onClick={fetchData}>
      {loading ? "Exporting..." : "Export Data"}
    </button>
  );
};
