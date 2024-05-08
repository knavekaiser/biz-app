import { useEffect, useState } from "react";
import {
  Combobox,
  Input,
  Moment,
  Select,
  Table,
  TableActions,
} from "Components/elements";
import s from "./store.module.scss";
import { endpoints, paths } from "config";
import { Modal, Prompt } from "Components/modal";
import { useFetch } from "hooks";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";

import StoreForm from "./StoreForm";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";

const Filters = ({ filters, setFilters }) => {
  const { handleSubmit, register, control, reset, watch } = useForm();

  return (
    <form
      className={s.filters}
      onSubmit={handleSubmit((values) => {
        // getValues -> setFilters(values)
        setFilters(
          Object.entries(values).reduce((p, [key, value]) => {
            if (value !== undefined) {
              p[key] = value;
            }
            return p;
          }, {})
        );
      })}
    >
      {/* <Input label="Product Name" {...register("productName")} /> */}

      <Select
        control={control}
        label="Business"
        url={endpoints.findBusinesses}
        getQuery={(inputValue, selected) => ({
          ...(inputValue && { name: inputValue }),
          ...(selected && { _id: selected }),
        })}
        handleData={(item) => ({
          label: item.name,
          value: item._id,
        })}
        name="business"
        className={s.itemName}
      />

      <Select
        control={control}
        label="Category"
        url={endpoints.adminDynamic + "/Store Category"}
        getQuery={(inputValue, selected) => ({
          ...(inputValue && { name: inputValue }),
          ...(selected && { _id: selected }),
        })}
        handleData={(item) => ({
          label: item.name,
          value: item._id,
        })}
        name="category"
        className={s.itemName}
      />

      <Combobox
        label="Featured"
        control={control}
        name="featured"
        options={[
          { label: "Yes", value: true },
          { label: "No", value: false },
        ]}
      />

      <div className="btns">
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

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [addStore, setAddStore] = useState(false);
  const [store, setStore] = useState(null);
  const [filters, setFilters] = useState({});
  const { get: getStores, loading } = useFetch(endpoints.stores);
  const navigate = useNavigate();

  const { remove: deleteStore, deleting } = useFetch(
    endpoints.stores + "/{ID}"
  );

  useEffect(() => {
    getStores({ query: filters })
      .then(({ data }) => {
        if (data.success) {
          setStores(data.data);
        } else {
          Prompt({ type: "error", message: data.message });
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, [filters]);

  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className="flex justify-space-between">
        <h2>All Listings</h2>
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

      <Filters filters={filters} setFilters={setFilters} />

      <Table
        loading={loading}
        className={s.sales}
        columns={[
          { label: "Created At" },
          { label: "Business" },
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
            <td>{item.business?.name}</td>
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
