import { useEffect, useState } from "react";
import { Table, TableActions } from "Components/elements";
import s from "./store.module.scss";
import { endpoints } from "config";
import { Modal, Prompt } from "Components/modal";
import { useFetch } from "hooks";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";

import StoreForm from "./StoreForm";

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [addStore, setAddStore] = useState(false);
  const [store, setStore] = useState(null);
  const { get: getStores, loading } = useFetch(endpoints.stores);

  const { remove: deleteStore, deleting } = useFetch(
    endpoints.stores + "/{ID}"
  );

  useEffect(() => {
    getStores()
      .then(({ data }) => {
        if (data.success) {
          setStores(data.data);
        } else {
          Prompt({ type: "error", message: data.message });
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);

  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className="flex">
        <h2>All Stores</h2>
        <button className="btn m-a mr-0" onClick={() => setAddStore(true)}>
          Add Store
        </button>
      </div>
      <Table
        loading={loading}
        className={s.sales}
        columns={[
          { label: "Store" },
          { label: "Business" },
          { label: "Action" },
        ]}
      >
        {stores.map((item) => (
          <tr style={{ cursor: "pointer" }} key={item._id}>
            <td>{item.name}</td>
            <td>{item.business?.name}</td>
            <TableActions
              className={s.actions}
              actions={[
                {
                  icon: <FaPencilAlt />,
                  label: "Update",
                  callBack: () => {
                    setStore(item);
                    setAddStore(true);
                  },
                },
                {
                  icon: <FaTrashAlt />,
                  label: "Delete",
                  callBack: () =>
                    Prompt({
                      type: "confirmation",
                      message: `Are you sure you want to remove this store?`,
                      callback: () => {
                        deleteStore({}, { params: { "{ID}": item._id } }).then(
                          ({ data }) => {
                            if (data.success) {
                              setStores((prev) =>
                                prev.filter((store) => store._id !== item._id)
                              );
                            } else {
                              Prompt({
                                type: "error",
                                message: data.message,
                              });
                            }
                          }
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
        open={addStore}
        head
        label={`${store ? "Update" : "Add"} Store`}
        className={s.addEmpFormModal}
        setOpen={() => {
          setStore(null);
          setAddStore(false);
        }}
      >
        <StoreForm
          edit={store}
          onSuccess={(newStore) => {
            if (store) {
              setStores((prev) => {
                if (newStore) {
                  return prev.map((item) =>
                    item._id === newStore._id ? newStore : item
                  );
                } else {
                  return prev.filter((item) => item._id !== store._id);
                }
              });
              setStore(null);
            } else {
              setStores((prev) => [...prev, newStore]);
            }
            setAddStore(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Stores;
