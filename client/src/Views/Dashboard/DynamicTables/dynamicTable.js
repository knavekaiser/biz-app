import { useContext, useEffect, useState, useRef } from "react";
import { SiteContext } from "SiteContext";
import { useNavigate, useParams } from "react-router-dom";
import { useYup, useFetch } from "hooks";
import { Prompt, Modal } from "Components/modal";
import { paths, endpoints } from "config";
import {
  Textarea,
  Table,
  DynamicTable,
  TableActions,
  ImportExport,
} from "Components/elements";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import s from "./payments.module.scss";

import DynamicForm from "./dynamicForm";

const DynamicTablePage = () => {
  const [edit, setEdit] = useState(null);
  const [addData, setAddData] = useState(false);
  const [data, setData] = useState([]);
  const [collection, setCollection] = useState(null);
  const [productCollection, setProductCollection] = useState(null);
  const navigate = useNavigate();
  const { "*": table } = useParams();
  const { get: getCollection, loading: gettingCollection } = useFetch(
    `${endpoints.collections}/${table}`
  );
  const {
    get: getProductCollection,
    loading: gettingProductCollection,
  } = useFetch(`${endpoints.collections}/Product`);
  const { get: getData, loading } = useFetch(`${endpoints.dynamic}/${table}`);
  const { remove: deleteData } = useFetch(`${endpoints.dynamic}/${table}/{ID}`);

  useEffect(() => {
    getData()
      .then(({ data }) => {
        if (data.success) {
          return setData(data.data);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
    getCollection()
      .then(({ data }) => {
        if (data.success) {
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
      <div className="flex justify-space-between">
        <h2>All {table}(s)</h2>
        <div className="flex gap-1">
          <ImportExport
            exportUrl={`${endpoints.dynamic}/${table}`}
            importUrl={`${endpoints.dynamicBulkCreate.replace(
              ":table",
              table
            )}`}
          />
          <button
            className="btn m-a mr-0"
            onClick={() => navigate(paths.dynamicTables.replace("/*", ""))}
          >
            Back
          </button>
          <button className="btn m-a mr-0" onClick={() => setAddData(true)}>
            Add {table}
          </button>
        </div>
      </div>
      <DynamicTable
        fields={collection?.fields}
        loading={gettingCollection || loading}
        data={data}
        actions={(item) => [
          {
            icon: <FaPencilAlt />,
            label: "Edit",
            callBack: () => {
              setEdit(item);
              setAddData(true);
            },
          },
          {
            icon: <FaRegTrashAlt />,
            label: "Delete",
            callBack: () =>
              Prompt({
                type: "confirmation",
                message: `Are you sure you want to remove this Collection?`,
                callback: () => {
                  deleteData({}, { params: { "{ID}": item._id } }).then(
                    ({ data }) => {
                      if (data.success) {
                        setData((prev) =>
                          prev.filter((data) => data._id !== item._id)
                        );
                      } else {
                        Prompt({ type: "error", message: data.message });
                      }
                    }
                  );
                },
              }),
          },
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
          {...(collection?.name === "Campaign" && { productCollection })}
          onSuccess={(newData) => {
            if (edit) {
              setData((prev) =>
                prev.map((t) => (t._id === edit._id ? newData : t))
              );
              setEdit(null);
            } else {
              setData((prev) => [...prev, newData]);
            }
            setAddData(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default DynamicTablePage;
