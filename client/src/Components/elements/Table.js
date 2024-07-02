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
import {
  FaSortDown,
  FaCircleNotch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Moment } from "./moment";
import {
  Images,
  FileInputNew,
  Combobox,
  MobileNumberInput,
  Input,
  Select,
} from "Components/elements";
import { BsFillGearFill } from "react-icons/bs";
import { useForm } from "react-hook-form";
import { useFetch, useYup } from "hooks";
import { toCSV, parseXLSXtoJSON } from "helpers";
import * as yup from "yup";
import { Modal, Prompt } from "../modal";
import { SiteContext } from "SiteContext";
import { endpoints } from "config";
// import { ProductThumb } from "Views/Home/productThumbnail";
import { ProductThumb } from "../ui/productThumbnail";
import { useParams } from "react-router-dom";

export const Table = ({
  admin,
  columns,
  className,
  theadTrStyle,
  tbodyTrStyle,
  children,
  sortable,
  actions,
  loading,
  placeholder,
  renderRow,
  pagination,
  url,
  filters: defaultFilters,
  filterFields,
  tfoot,
}) => {
  const { business } = useContext(SiteContext);
  const [productView, setProductView] = useState("rows");
  const [productTable, setProductTable] = useState(url?.endsWith("/Product"));
  const [filters, setFilters] = useState({});
  const { control, reset } = useForm();
  const [metadata, setMetadata] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
  });
  const [dynamicData, setDynamicData] = useState([]);
  const { get: fetchData, loading: loadingData } = useFetch(url);

  const tbody = useRef();
  const table = useRef();

  const getData = useCallback(
    (newMetadata) => {
      fetchData({
        query: {
          ...(pagination && {
            page: metadata.page,
            pageSize: metadata.pageSize,
            ...newMetadata,
          }),
          ...filters,
        },
      })
        .then(({ data }) => {
          if (data.success) {
            setDynamicData(data.data);
            setMetadata(data.metadata);
          } else {
            Prompt({ type: "error", message: data.message });
          }
        })
        .catch((err) => Prompt({ type: "error", message: err.message }));
    },
    [metadata, filters]
  );
  useEffect(() => {
    reset({ pageSize: metadata.pageSize });
  }, []);

  useEffect(() => {
    if (url) {
      getData({ page: 1 });
    }
  }, [filters, defaultFilters]);

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
      {(columns || filterFields?.length) && (
        <thead>
          {filterFields?.length ? (
            <tr className={s.filters}>
              <td>
                <Filters
                  productTable={productTable}
                  productView={productView}
                  setProductView={setProductView}
                  admin={admin}
                  filterFields={filterFields}
                  filters={filters}
                  setFilters={setFilters}
                />
              </td>
            </tr>
          ) : null}
          <tr className={`${s.filters} ${s.rowCount}`}>
            <td>Showing Records: {(children || dynamicData).length}</td>
          </tr>
          {productTable && productView === "grid" ? null : (
            <tr style={theadTrStyle}>
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
          )}
        </thead>
      )}
      <tbody
        ref={tbody}
        className={productTable && productView === "grid" ? s.productGrid : ""}
      >
        {loading || loadingData ? (
          <tr className={s.loading}>
            <td>
              <span className={s.icon}>
                <FaCircleNotch />
              </span>
            </td>
          </tr>
        ) : ((Array.isArray(children) ? children : [children]) || dynamicData)
            .length > 0 ? (
          <>
            {children ||
              dynamicData.map((item, i) =>
                productTable && productView === "grid" ? (
                  <tr key={item._id}>
                    <td>
                      <ProductThumb
                        product={item}
                        onClick={(e) => {
                          e.stopPropagation();
                          const editAction = actions(item)?.find(
                            (ac) => ac.label === "Edit"
                          )?.callBack;
                          if (editAction) {
                            editAction(item);
                          }
                          // console.log(editAction);
                        }}
                      />
                    </td>
                  </tr>
                ) : (
                  renderRow(item, i)
                )
              )}
          </>
        ) : (
          <tr className={s.placeholder} style={tbodyTrStyle}>
            <td>{placeholder || "Nothing yet..."}</td>
          </tr>
        )}
      </tbody>
      {tfoot}
      {pagination && (
        <tfoot>
          <tr className={s.pagination}>
            <td>
              <Combobox
                control={control}
                name="pageSize"
                label="Per Page"
                className={s.perPage}
                options={[
                  { label: "10", value: 10 },
                  { label: "20", value: 20 },
                  { label: "30", value: 30 },
                  { label: "50", value: 50 },
                  { label: "100", value: 100 },
                ]}
                onChange={(v) => {
                  getData({ pageSize: v.value });
                }}
              />
              <span className={s.pageSummary}>
                {metadata.pageSize * (metadata.page - 1) + 1}-
                {metadata.pageSize * (metadata.page - 1) + dynamicData.length}{" "}
                of {metadata.total}
              </span>
              <button
                title="Previous Page"
                className="btn"
                disabled={metadata.page <= 1}
                onClick={() => {
                  getData({ page: metadata.page - 1 });
                }}
              >
                <FaChevronLeft />
              </button>
              <span className={s.currentPage}>{metadata.page}</span>
              <button
                title="Next Page"
                className="btn"
                disabled={metadata.page * metadata.pageSize >= metadata.total}
                onClick={() => {
                  getData({ page: metadata.page + 1 });
                }}
              >
                <FaChevronRight />
              </button>
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
};

const Filters = ({
  productTable,
  productView,
  setProductView,
  admin,
  filterFields,
  filters,
  setFilters,
}) => {
  const { handleSubmit, register, control, reset, watch } = useForm();

  const fields = filterFields.map((field, i) => {
    if (field.name === "variants" || field.inputType === "file") {
      return null;
    }
    // if (field.dataType === "object" && field.fieldType === "collectionFilter") {
    //   const value = watch(field.name);
    //   return (
    //     <ProductFilterForm
    //       key={field.name}
    //       field={field}
    //       value={value}
    //       productCollection={productCollection}
    //       setValue={setValue}
    //     />
    //   );
    // }
    // if (
    //   ["array", "variantArray"].includes(field.dataType) &&
    //   field.dataElementType === "object"
    // ) {
    //   const values = watch(field.name);
    //   return (
    //     <NestedObjectTable
    //       collection={collection}
    //       key={field.name}
    //       values={values}
    //       field={field}
    //       setValue={setValue}
    //     />
    //   );
    // }
    // if (field.fieldType === "dateRange") {
    //   if (field.inputType === "calendar") {
    //     return (
    //       <CalendarInput
    //         key={field.name}
    //         control={control}
    //         label={field.label}
    //         name={field.name}
    //         dateWindow={field.dateWindow}
    //         required={field.required}
    //         disabledDates={field.disabledDates || []}
    //         multipleRanges={field.multipleRanges}
    //       />
    //     );
    //   }
    // }
    if (field.fieldType === "input") {
      if (field.inputType === "phone") {
        return (
          <MobileNumberInput
            label={field.label}
            key={field.name}
            name={field.name}
            control={control}
          />
        );
      }
      return (
        <Input
          key={field.name}
          {...register(field.name)}
          type={field.inputType || "text"}
          label={field.label}
        />
      );
    }
    if (field.fieldType === "textarea") {
      return (
        <Input key={field.name} {...register(field.name)} label={field.label} />
      );
    }
    // if (field.fieldType === "richText") {
    //   return (
    //     <Input
    //       key={field.name}
    //       control={control}
    //       name={field.name}
    //       label={field.label}
    //     />
    //   );
    // }
    if (field.fieldType === "combobox") {
      return (
        <Combobox
          key={field.name}
          label={field.label}
          control={control}
          name={field.name}
          multiple={field.multiple}
          options={field.options || []}
        />
      );
    }
    if (field.fieldType === "select") {
      return (
        <Select
          key={field.name}
          control={control}
          label={field.label}
          {...(field.optionType === "predefined" && {
            options: field.options || [],
          })}
          {...(field.optionType === "collection" && {
            url: `${admin ? endpoints.adminDynamic : endpoints.dynamic}/${
              field.collection
            }`,
          })}
          getQuery={(inputValue, selected) => ({
            ...(inputValue && { [field.optionLabel]: inputValue }),
            ...(selected && { [field.optionValue]: selected }),
          })}
          handleData={(item) => ({
            label: item[field.optionLabel],
            value: item[field.optionValue],
          })}
          multiple={field.multiple}
          name={field.name}
          className={s.itemName}
        />
      );
    }
  });

  return (
    <form
      onSubmit={handleSubmit((values) => {
        // getValues -> setFilters(values)
        setFilters(
          Object.entries(values).reduce((p, [key, value]) => {
            if (value) {
              p[key] = value;
            }
            return p;
          }, {})
        );
      })}
    >
      {fields}
      <div className="btns">
        {productTable && (
          <button
            title={`View in ${productView === "rows" ? "grid" : "row"}`}
            className="btn"
            onClick={() => {
              setProductView((prev) => (prev === "rows" ? "grid" : "rows"));
            }}
          >
            {`View in ${productView === "rows" ? "grid" : "row"}`}
          </button>
        )}
        <button className={"btn"}>Search</button>
        <button
          className={"btn"}
          type="button"
          onClick={() => {
            reset();
            setFilters({});
          }}
        >
          Clear
        </button>
      </div>
    </form>
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
        top: (
          window.innerHeight -
          ((popupContainerRef.current?.querySelector("button").clientHeight ||
            35) *
            actions.length +
            8)
        ).clamp(8, y + height),
        maxHeight: window.innerHeight - 16,
      });
    }
  }, [open]);
  return actions.length < 4 ? (
    <td
      className={`${s.tableActions} ${className || ""}`}
      data-testid="tableActions"
      onClick={(e) => e.stopPropagation()}
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
    <td
      className={`${s.tableActions} ${className || ""}`}
      onClick={(e) => e.stopPropagation()}
    >
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
  admin,
  fields = [],
  data = [],
  url,
  pagination,
  loading,
  filters,
  filterFields,
  actions,
  className = "",
  select,
}) => {
  const { config } = useContext(SiteContext);
  const [selected, setSelected] = useState(null);

  const { "*": table } = useParams();

  const columns = [
    ...(table === "Product"
      ? [{ label: "Created At" }, { label: "Updated At" }]
      : []),
    ...(fields.map((field) => ({ label: field.label })) || []),
    ...(actions ? [{ label: "Action", className: s.actions }] : []),
  ];
  const renderRow = useCallback(
    (item, i) => {
      return (
        <tr
          key={item._id || i}
          style={{
            gridTemplateColumns:
              Array(fields.length).fill("1fr").join(" ") +
              (table === "Product" ? " 1fr 1fr" : "") +
              (actions ? " 4rem" : ""),
            background:
              selected?._id === item._id ? "rgba(67, 138, 138, 0.2)" : "",
          }}
          onClick={(e) => {
            if (window.innerWidth > 480) return;
            if (select) {
              if (selected?._id === item._id) {
                setSelected(null);
              } else {
                setSelected(item);
              }
            }
          }}
        >
          {table === "Product" && (
            <>
              <td>
                <p>
                  <Moment format="MMM DD, YY">{item.createdAt}</Moment>
                </p>
                <small>
                  <Moment format="hh:mma">{item.createdAt}</Moment>
                </small>
              </td>
              <td>
                <p>
                  <Moment format="MMM DD, YY">{item.updatedAt}</Moment>
                </p>
                <small>
                  <Moment format="hh:mma">{item.updatedAt}</Moment>
                </small>
              </td>
            </>
          )}
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
            if (field.fieldType === "combobox" && field.options?.length) {
              return (
                <td key={j}>
                  {field.options?.find((opt) => opt.value == item[field.name])
                    ?.label || item[field.name]}
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
                <td key={j} onClick={(e) => e.stopPropagation()}>
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
                    ? item[field.name].toLocaleString(config?.numberSeparator)
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
          {window.innerWidth > 480 || selected?._id === item._id ? (
            <TableActions actions={actions(item)} />
          ) : (
            <td style={{ minWidth: "4rem", border: "none" }} />
          )}
        </tr>
      );
    },
    [fields, selected]
  );

  return url ? (
    <Table
      admin={admin}
      loading={loading}
      url={url}
      pagination={pagination}
      className={`${s.dynamic} ${className}`}
      columns={columns}
      filters={filters}
      filterFields={filterFields || fields}
      renderRow={renderRow}
      actions={actions}
      theadTrStyle={{
        gridTemplateColumns:
          Array(fields.length).fill("1fr").join(" ") +
          (table === "Product" ? " 1fr 1fr" : "") +
          (actions ? " 4rem" : ""),
      }}
    />
  ) : (
    <Table
      admin={admin}
      loading={loading}
      className={className}
      columns={columns}
      theadTrStyle={{
        gridTemplateColumn: Array(fields.length + (actions ? 1 : 0))
          .fill("55px")
          .join(" "),
      }}
    >
      {data.map((item, i) => renderRow(item, i))}
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

export const ImportExport = ({
  importUrl,
  exportUrl,
  collection,
  templateData,
  onSuccess,
}) => {
  const [importOpen, setImportOpen] = useState(false);
  return (
    <div className={"flex gap-1 wrap"}>
      {importUrl && (
        <>
          <button className="btn" onClick={() => setImportOpen(true)}>
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
              collection={collection}
              onSuccess={() => {
                setImportOpen(false);
                onSuccess();
              }}
            />
          </Modal>
        </>
      )}
      {exportUrl && <Export url={exportUrl} />}
      {templateData?.length ? (
        <Export label="Download Template" data={templateData} />
      ) : null}
    </div>
  );
};

const ImportForm = ({ url, onSuccess, collection }) => {
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
        parseXLSXtoJSON(values.file[0], collection, (data) => {
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

const Export = ({ label, url, data: staticData }) => {
  const { get: getData, loading } = useFetch(url);
  const processData = useCallback((data) => {
    const keys = Object.keys(data[0]).filter((key) => key !== "__V");
    const rawCSV = toCSV(
      keys,
      data.map((data) => keys.map((key) => data[key]))
    );

    const link = encodeURI(rawCSV);

    const a = document.createElement("a");
    a.setAttribute("id", "export-user-link");
    a.setAttribute("href", link);
    a.setAttribute("download", "data.csv");
    document.body.appendChild(a);
    a.click();
    document.querySelector("#export-user-link").remove();
  }, []);

  const fetchData = useCallback(() => {
    if (url) {
      getData()
        .then(({ data }) => {
          if (data?.success) {
            if (!data.data.length) {
              return Prompt({ type: "error", message: "There are no data" });
            }
            processData(data.data);
          }
        })
        .catch((err) => Prompt({ type: "error", message: err.message }));
    } else if (staticData) {
      processData(staticData);
    }
  }, [url]);
  return staticData ? (
    <button disabled={loading} className="btn" onClick={fetchData}>
      {label}
    </button>
  ) : (
    <button disabled={loading} className="btn" onClick={fetchData}>
      {loading ? "Exporting..." : "Export Data"}
    </button>
  );
};
