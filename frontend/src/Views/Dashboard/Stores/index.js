import { useEffect, useRef, useState } from "react";
import {
  Combobox,
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
import { BsList } from "react-icons/bs";
import { GoArrowLeft, GoPlus } from "react-icons/go";
import { BiFilter } from "react-icons/bi";

const Filters = ({ showFilter, filters, setFilters }) => {
  const formRef = useRef();
  const { handleSubmit, register, control, reset, watch } = useForm();

  return (
    <div
      style={{
        height: `${showFilter ? formRef.current?.scrollHeight || 0 : 0}px`,
      }}
      className={s.filterWrapper}
    >
      <form
        ref={formRef}
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
    </div>
  );
};

const Stores = ({ setSidebarOpen }) => {
  const [stores, setStores] = useState([]);
  const [addStore, setAddStore] = useState(false);
  const [store, setStore] = useState(null);
  const [filters, setFilters] = useState({});
  const [showFilter, setShowFilter] = useState(false);
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
    <div className={`${s.content} grid gap-1 m-a`}>
      <div className={`${s.head} flex justify-space-between`}>
        <div
          className={`flex align-center pointer gap_5  ml-1`}
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <BsList style={{ fontSize: "1.75rem" }} />
          <h2>All Listings</h2>
          <button
            className="btn clear iconOnly"
            onClick={(e) => {
              e.stopPropagation();
              setAddStore(true);
            }}
          >
            <GoPlus />
          </button>
        </div>
        <div className="flex gap-1">
          <button
            title="Toggle Filters"
            className={`btn clear ${s.filterBtn}`}
            onClick={() => setShowFilter(!showFilter)}
          >
            <span
              className={`${s.indicator} ${
                Object.values(filters).length > 0 ? s.active : ""
              }`}
            />
            <BiFilter />
          </button>
        </div>
      </div>

      <Filters
        showFilter={showFilter}
        filters={filters}
        setFilters={setFilters}
      />

      <Table
        loading={loading}
        className={s.sales}
        columns={[
          { label: "Created At" },
          { label: "Business" },
          { label: "Category" },
          { label: "Subcategory" },
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
            <td>{item.subcategory}</td>
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
                  onClick: () => {
                    setStore(item);
                    setAddStore(true);
                  },
                },
                {
                  icon: <FaTrashAlt />,
                  label: "Delete",
                  onClick: () =>
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
