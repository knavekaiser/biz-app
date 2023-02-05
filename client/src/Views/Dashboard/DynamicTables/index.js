import { useEffect, useState, useCallback, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFetch } from "hooks";
import { Prompt, Modal } from "Components/modal";
import { paths, endpoints } from "config";
import { Table, TableActions } from "Components/elements";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import s from "./payments.module.scss";

import CollectionForm from "./form";
import DynamicTable from "./dynamicTable";
import SchemaForm from "./schemaTemplateForm";
import { SiteContext } from "SiteContext";

const Collections = () => {
  const { checkPermission } = useContext(SiteContext);
  const [edit, setEdit] = useState(null);
  const [addCollection, setAddCollection] = useState(false);
  const [importSchema, setImportSchema] = useState(false);
  const [collections, setCollections] = useState([]);
  const { get: getCollections, loading } = useFetch(endpoints.collections);
  const { remove: deleteCollection, loading: deleting } = useFetch(
    endpoints.collections + `/{ID}`
  );
  const navigate = useNavigate();
  const { "*": table } = useParams();

  const fetchRecords = useCallback(() => {
    getCollections()
      .then(({ data }) => {
        if (data.success) {
          return setCollections(data.data);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);

  useEffect(() => {
    fetchRecords();
  }, []);

  if (table) {
    return <DynamicTable />;
  }
  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className="flex justify-space-between">
        <h2>All Tables</h2>
        <div className="flex gap-1">
          <button
            className="btn m-a mr-0"
            onClick={() => setImportSchema(true)}
          >
            Import Schema
          </button>
          <button
            className="btn m-a mr-0"
            onClick={() => setAddCollection(true)}
          >
            Add Table
          </button>
        </div>
      </div>
      <Table
        loading={loading}
        className={s.collections}
        columns={[{ label: "Name" }, { label: "Action" }]}
      >
        {collections.map((item, i) => (
          <tr
            key={i}
            onClick={(e) => {
              if (e.target.tagName === "TD") {
                navigate(paths.dynamicTable.replace(":table", item.name));
              }
            }}
          >
            <td>{item.name}</td>
            <TableActions
              actions={[
                ...(checkPermission("dynamic_table_update")
                  ? [
                      {
                        icon: <FaPencilAlt />,
                        label: "Edit",
                        callBack: () => {
                          setEdit(item);
                          setAddCollection(true);
                        },
                      },
                    ]
                  : []),
                ...(checkPermission("dynamic_table_delete")
                  ? [
                      {
                        icon: <FaRegTrashAlt />,
                        label: "Delete",
                        disabled: deleting,
                        callBack: () =>
                          Prompt({
                            type: "confirmation",
                            message: `Are you sure you want to remove this Collection?`,
                            callback: () => {
                              deleteCollection(
                                {},
                                {
                                  params: {
                                    "{ID}": item._id,
                                  },
                                }
                              )
                                .then(({ data }) => {
                                  if (data?.success) {
                                    setCollections((prev) =>
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
                    ]
                  : []),
              ]}
            />
          </tr>
        ))}
      </Table>

      <Modal
        head
        label={edit ? "Update Collection" : "Add Collection"}
        open={addCollection}
        setOpen={() => {
          setAddCollection(false);
          setEdit(null);
        }}
        className={s.collectionFormModal}
      >
        <CollectionForm
          collections={collections}
          edit={edit}
          onSuccess={(newCollection) => {
            if (edit) {
              setCollections((prev) =>
                prev.map((t) =>
                  t._id.toLowerCase() === edit._id.toLowerCase()
                    ? newCollection
                    : t
                )
              );
              setEdit(newCollection);
            } else {
              setCollections((prev) => [...prev, newCollection]);
            }
            // setAddCollection(false);
          }}
        />
      </Modal>

      <Modal
        head
        label="Import Schema"
        open={importSchema}
        setOpen={() => {
          setImportSchema(false);
        }}
        className={s.collectionFormModal}
      >
        <SchemaForm
          onSuccess={(schemas) => {
            setImportSchema(false);
            fetchRecords();
          }}
        />
      </Modal>
    </div>
  );
};

export default Collections;
