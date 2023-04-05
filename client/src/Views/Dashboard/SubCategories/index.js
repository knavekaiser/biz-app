import { useEffect, useState, useCallback, useContext } from "react";
import { useFetch } from "hooks";
import { Prompt, Modal } from "Components/modal";
import { endpoints } from "config";
import { Table, TableActions } from "Components/elements";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import s from "./payments.module.scss";

import CollectionForm from "./form";
import { SiteContext } from "SiteContext";

const Collections = () => {
  const [edit, setEdit] = useState(null);
  const [collections, setCollections] = useState([]);
  const [schemas, setSchemas] = useState([]);
  const { get: getCollections } = useFetch(endpoints.adminCollections);
  const { get: getSchema, loading } = useFetch(endpoints.adSchemas);
  const { remove: deleteSchema, loading: deleting } = useFetch(
    endpoints.adSchemas + `/{ID}`
  );

  const fetchRecords = useCallback(() => {
    getSchema()
      .then(({ data }) => {
        if (data.success) {
          return setSchemas(data.data);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);

  useEffect(() => {
    fetchRecords();
    getCollections()
      .then(({ data }) => {
        if (data.success) {
          return setCollections(data.data);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);

  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className="flex justify-space-between">
        <h2>All Sub Categories</h2>
        <div className="flex gap-1">
          <button className="btn m-a mr-0" onClick={() => setEdit(true)}>
            Add Sub Categories
          </button>
        </div>
      </div>
      <Table
        loading={loading}
        className={s.collections}
        columns={[{ label: "Name" }, { label: "Action" }]}
      >
        {schemas.map((item, i) => (
          <tr key={i}>
            <td>{item.name}</td>
            <TableActions
              actions={[
                {
                  icon: <FaPencilAlt />,
                  label: "Edit",
                  callBack: () => {
                    setEdit(item);
                  },
                },
                {
                  icon: <FaRegTrashAlt />,
                  label: "Delete",
                  disabled: deleting,
                  callBack: () =>
                    Prompt({
                      type: "confirmation",
                      message: `Are you sure you want to remove this Sub Category?`,
                      callback: () => {
                        deleteSchema(
                          {},
                          {
                            params: {
                              "{ID}": item._id,
                            },
                          }
                        )
                          .then(({ data }) => {
                            if (data?.success) {
                              setSchemas((prev) =>
                                prev.filter(
                                  (product) => product._id !== item._id
                                )
                              );
                            }
                          })
                          .catch((err) =>
                            Prompt({
                              type: "error",
                              message: err.message,
                            })
                          );
                      },
                    }),
                },
              ]}
            />
          </tr>
        ))}
      </Table>

      <Modal
        head
        label={`${edit?._id ? "Update" : "Add"} Sub Category`}
        open={!!edit}
        setOpen={() => {
          setEdit(null);
        }}
        className={s.collectionFormModal}
      >
        <CollectionForm
          collections={collections.filter((item) => item.name !== "Category")}
          edit={edit?._id ? edit : null}
          onSuccess={(newSchema) => {
            if (edit?._id) {
              setSchemas((prev) =>
                prev.map((t) =>
                  t._id.toLowerCase() === edit._id.toLowerCase() ? newSchema : t
                )
              );
              setEdit(newSchema);
            } else {
              setEdit(newSchema);
              setSchemas((prev) => [...prev, newSchema]);
            }
          }}
        />
      </Modal>
    </div>
  );
};

export default Collections;
