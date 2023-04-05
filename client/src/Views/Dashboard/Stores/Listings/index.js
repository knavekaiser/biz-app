import { useEffect, useState } from "react";
import { Moment, Table, TableActions } from "Components/elements";
import s from "./store.module.scss";
import { endpoints, paths } from "config";
import { Modal, Prompt } from "Components/modal";
import { useFetch } from "hooks";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";

import StoreForm from "./StoreForm";
import { useNavigate, useParams } from "react-router-dom";

const Stores = () => {
  const [business, setBusiness] = useState(null);
  const [stores, setStores] = useState([]);
  const [addStore, setAddStore] = useState(false);
  const [store, setStore] = useState(null);
  const { get: getStores, loading } = useFetch(endpoints.stores);
  const { get: getBusiness } = useFetch(endpoints.findBusinesses);
  const { storeId } = useParams();
  const navigate = useNavigate();

  const { remove: deleteStore, deleting } = useFetch(
    endpoints.stores + "/{ID}"
  );

  useEffect(() => {
    getStores({ query: { business: storeId } })
      .then(({ data }) => {
        if (data.success) {
          setStores(data.data);
        } else {
          Prompt({ type: "error", message: data.message });
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);

  useEffect(() => {
    getBusiness({ query: { _id: storeId } })
      .then(({ data }) => {
        if (data.data?.length) {
          setBusiness(data.data[0]);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);

  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className="flex justify-space-between">
        <h2>All Listings {business && <span> - {business.name}</span>}</h2>
        <div className="flex gap-1">
          <button
            className="btn"
            onClick={() =>
              navigate(paths.dashboard.replace("*", "") + paths.stores)
            }
          >
            Back
          </button>
          <button className="btn" onClick={() => setAddStore(true)}>
            Add Listing
          </button>
        </div>
      </div>
      <Table
        loading={loading}
        className={s.sales}
        columns={[
          { label: "Created At" },
          { label: "Category" },
          { label: "Sub Category" },
          { label: "Created By" },
          { label: "Effective Period" },
          { label: "Featured" },
          { label: "Action" },
        ]}
      >
        {stores.map((item) => (
          <tr style={{ cursor: "pointer" }} key={item._id}>
            <td>
              <Moment format="MMM DD, YY hh:mma">{item.createdAt}</Moment>
            </td>
            <td>{item.category}</td>
            <td>{item.subCategory}</td>
            <td>{item.createdBy?.name}</td>
            <td>
              <Moment format="MMM DD, YY">{item.start}</Moment> -{" "}
              <Moment format="MMM DD, YY">{item.end}</Moment>
            </td>
            <td>{item.featured ? "Yes" : "No"}</td>
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
                      message: `Are you sure you want to remove this listing?`,
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
        className={s.addStoreFormModal}
        setOpen={() => {
          setStore(null);
          setAddStore(false);
        }}
      >
        <StoreForm
          storeId={storeId}
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
