import { useContext, useEffect, useState } from "react";
import { SiteContext } from "SiteContext";
import { useNavigate, useParams } from "react-router-dom";
import { useFetch } from "hooks";
import { Prompt, Modal } from "Components/modal";
import { paths, endpoints } from "config";
import { DynamicTable, ImportExport } from "Components/elements";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import s from "./payments.module.scss";

import DynamicForm from "./dynamicForm";

const DynamicTablePage = () => {
  const [filters, setFilters] = useState({});
  const { business, checkPermission } = useContext(SiteContext);
  const [templateData, setTemplateData] = useState([]);
  const [edit, setEdit] = useState(null);
  const [addData, setAddData] = useState(false);
  const [collection, setCollection] = useState(null);
  const [productCollection, setProductCollection] = useState(null);
  const navigate = useNavigate();
  const { "*": table } = useParams();
  const { get: getCollection, loading: gettingCollection } = useFetch(
    `${endpoints.collections}/${table}`
  );
  const { get: getProductCollection, loading: gettingProductCollection } =
    useFetch(`${endpoints.collections}/Product`);
  const { remove: deleteData } = useFetch(`${endpoints.dynamic}/${table}/{ID}`);

  useEffect(() => {
    getCollection()
      .then(({ data }) => {
        if (data.success) {
          const _template = [];
          for (let i = 0; i < 5; i++) {
            const item = {};
            data.data.fields.forEach((field) => {
              if (field.dataType === "date") {
                return (item[field.name] = new Date()
                  .toISOString()
                  .substring(0, 10));
              }
              if (field.dataType === "number") {
                return (item[field.name] =
                  +(Math.random() * 1000).toFixed(0) + 1000);
              }
              if (field.dataType === "objectId") {
                return (item[field.name] =
                  new Date().getTime().toString(16) +
                  (+(Math.random() * 10000000000000000000).toFixed(0)).toString(
                    16
                  ));
              }
              if (
                ["combobox", "select"].includes(field.fieldType) &&
                field.options?.length
              ) {
                return (item[field.name] =
                  field.options[i]?.value || field.options[0]?.value);
              }
              item[field.name] = `${field.label} ${i}`;
            });
            _template.push(item);
          }
          setTemplateData(_template);
          return setCollection(data.data);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
    if (table === "Campaign") {
      getProductCollection()
        .then(({ data }) => {
          if (data.success) {
            return setProductCollection(data.data);
          }
        })
        .catch((err) => Prompt({ type: "error", message: err.message }));
    }
  }, []);
  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div
        className={`${
          window.innerWidth <= 480 ? "grid gap-1" : "flex"
        } justify-space-between`}
      >
        <h2>All {table}(s)</h2>
        <div className={`flex gap-1 wrap`}>
          <ImportExport
            exportUrl={`${endpoints.dynamic}/${table}`}
            importUrl={
              checkPermission(`${business?.business._id}_${table}_create`)
                ? `${endpoints.dynamicBulkCreate.replace(":table", table)}`
                : null
            }
            collection={collection}
            templateData={templateData}
            onSuccess={() => setFilters((prev) => ({ ...prev }))}
          />
          <button
            className="btn"
            onClick={() =>
              navigate(
                paths.dashboard.replace("*", "") +
                  paths.dynamicTables.replace("/*", "")
              )
            }
          >
            Back
          </button>
          {checkPermission(`${business?.business._id}_${table}_create`) && (
            <button className="btn" onClick={() => setAddData(true)}>
              Add {table}
            </button>
          )}
        </div>
      </div>
      <DynamicTable
        fields={collection?.fields}
        loading={gettingCollection}
        url={`${endpoints.dynamic}/${table}`}
        filters={filters}
        pagination
        select
        actions={(item) => [
          ...(checkPermission(`${business?.business._id}_${table}_update`)
            ? [
                {
                  icon: <FaPencilAlt />,
                  label: "Edit",
                  onClick: () => {
                    setEdit(item);
                    setAddData(true);
                  },
                },
              ]
            : []),
          ...(checkPermission(`${business?.business._id}_${table}_delete`)
            ? [
                {
                  icon: <FaRegTrashAlt />,
                  label: "Delete",
                  onClick: () =>
                    Prompt({
                      type: "confirmation",
                      message: `Are you sure you want to remove this Collection?`,
                      callback: () => {
                        deleteData({}, { params: { "{ID}": item._id } }).then(
                          ({ data }) => {
                            if (data.success) {
                              setFilters((prev) => ({ ...prev }));
                              // setData((prev) =>
                              //   prev.filter((data) => data._id !== item._id)
                              // );
                            } else {
                              Prompt({ type: "error", message: data.message });
                            }
                          }
                        );
                      },
                    }),
                },
              ]
            : []),
        ]}
      />
      <Modal
        head
        label={`${edit ? "Update" : "Add"} ${collection?.name || "Collection"}`}
        open={addData}
        setOpen={() => {
          setAddData(false);
          setEdit(null);
        }}
        className={s.dynamicFormModal}
      >
        <DynamicForm
          edit={edit}
          collection={collection}
          prefill={addData?.title ? addData : null}
          {...(["Campaign", "Order"].includes(collection?.name) && {
            productCollection,
          })}
          onSuccess={(newData, addNew = false) => {
            if (edit) {
              setFilters((prev) => ({ ...prev }));
              // setData((prev) =>
              //   prev.map((t) => (t._id === edit._id ? newData : t))
              // );
              setEdit(null);
            } else {
              setFilters((prev) => ({ ...prev }));
              // setData((prev) => [...prev, newData]);
            }
            if (addNew) {
              setAddData({
                category: newData.category,
                subcategory: newData.subcategory,
                title: newData.title,
                price: newData.price,
                description: newData.description,
                whatsappNumber: newData.whatsappNumber,
              });
            } else {
              setAddData(false);
            }
          }}
        />
      </Modal>
    </div>
  );
};

export default DynamicTablePage;
