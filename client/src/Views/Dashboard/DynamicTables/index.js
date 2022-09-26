import { useContext, useEffect, useState, useRef } from "react";
import { SiteContext } from "SiteContext";
import { useNavigate, useParams } from "react-router-dom";
import { useYup, useFetch } from "hooks";
import { Prompt, Modal } from "Components/modal";
import { paths, endpoints } from "config";
import { Textarea, Table, TableActions } from "Components/elements";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import s from "./payments.module.scss";

import CollectionForm from "./form";
import DynamicTable from "./dynamicTable";

const Collections = () => {
  const [edit, setEdit] = useState(null);
  const [addCollection, setAddCollection] = useState(false);
  const [collections, setCollections] = useState([]);
  const { get: getCollections, loading } = useFetch(endpoints.collections);
  const navigate = useNavigate();
  const { "*": table } = useParams();

  useEffect(() => {
    getCollections()
      .then(({ data }) => {
        if (data.success) {
          return setCollections(data.data);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);

  if (table) {
    return <DynamicTable />;
  }
  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className="flex">
        <h2>All Tables</h2>
        <button className="btn m-a mr-0" onClick={() => setAddCollection(true)}>
          Add Table
        </button>
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
                {
                  icon: <FaPencilAlt />,
                  label: "Edit",
                  callBack: () => {
                    setEdit(item);
                    setAddCollection(true);
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
                        setCollections((prev) =>
                          prev.filter((product) => product._id !== item._id)
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
              setEdit(null);
            } else {
              setCollections((prev) => [...prev, newCollection]);
            }
            setAddCollection(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Collections;
