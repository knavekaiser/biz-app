import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Input,
  Combobox,
  Table,
  TableActions,
  moment,
} from "Components/elements";
import { useYup } from "hooks";
import { Prompt } from "Components/modal";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import * as yup from "yup";
import s from "./dashboard.module.scss";

const mainSchema = yup.object({
  date: yup.string().required(),
  gst: yup.number().required().typeError("Enter a valid Number"),
});

const itemSchema = yup.object({
  name: yup.string().required(),
  price: yup
    .number()
    .min(0, "Price can not be less than 0")
    .required()
    .typeError("Enter a valid Number"),
  qty: yup
    .number()
    .min(1, "QTY can not be less than 1")
    .required()
    .typeError("Enter a valid Number"),
  unit: yup.lazy((value) => {
    switch (typeof value) {
      case "object":
        return yup.object().typeError("Select a unit").required();
      case "string":
        return yup.string().required();
      default:
        return yup.mixed().required();
    }
  }),
});

const Detail = ({ label, value }) => {
  return (
    <p className={s.detail}>
      <span className={s.label}>{label}</span>:{" "}
      <span className={s.value}>{value}</span>
    </p>
  );
};

const Form = ({ edit, onSuccess }) => {
  const navigate = useNavigate();
  const [viewOnly, setViewOnly] = useState(!!edit);
  const [items, setItems] = useState(edit?.items || []);
  const [editItem, setEditItem] = useState(null);
  const [err, setErr] = useState(null);
  return (
    <div className={`grid gap-1 p-1 ${s.addSaleForm}`}>
      {viewOnly && (
        <>
          <div className="flex jsb align-center">
            <h3>Sale Information</h3>
            <button className="btn" onClick={() => setViewOnly(false)}>
              Edit Sale
            </button>
          </div>
          <div>
            <Detail
              label="Date"
              value={moment(edit?.date, "DD-MM-YYYY hh:mma")}
            />
            <Detail label="Gst" value={(edit?.gst || 0) + "%"} />
            <Detail
              label="NET"
              value={edit.items.reduce((p, c) => p + c.qty * c.price, 0)}
            />
            <Detail
              label="Total"
              value={
                edit.items.reduce((p, c) => p + c.qty * c.price, 0) +
                edit.items
                  .reduce((p, c) => p + c.qty * c.price, 0)
                  .percent(edit.gst)
              }
            />
          </div>
        </>
      )}

      <h3>Items</h3>
      {items.length > 0 ? (
        <Table
          columns={[
            { label: "Product" },
            { label: "Price" },
            { label: "QTY" },
            { label: "Unit" },
            { label: "Total" },
            ...(viewOnly ? [] : [{ label: "Action" }]),
          ]}
        >
          {items.map((item, i) => (
            <tr key={i}>
              <td>{item.name}</td>
              <td>{item.price}</td>
              <td>{item.qty}</td>
              <td>{item.unit}</td>
              <td>{item.price * item.qty}</td>
              {!viewOnly && (
                <TableActions
                  actions={[
                    {
                      icon: <FaPencilAlt />,
                      label: "Edit",
                      callBack: () => setEditItem(item),
                    },
                    {
                      icon: <FaRegTrashAlt />,
                      label: "Delete",
                      callBack: () =>
                        Prompt({
                          type: "confirmation",
                          message: `Are you sure you want to remove this Item?`,
                          callback: () => {
                            setItems((prev) =>
                              prev.filter((product) => product.id !== item.id)
                            );
                          },
                        }),
                    },
                  ]}
                />
              )}
            </tr>
          ))}
        </Table>
      ) : (
        <p className={s.noContent}>No items yet.</p>
      )}
      {err && <p className="error">{err}</p>}

      {!viewOnly && (
        <>
          <ItemForm
            key={editItem ? "edit" : "add"}
            edit={editItem}
            onSuccess={(newItem) => {
              setErr(null);
              if (editItem) {
                setItems((prev) =>
                  prev.map((item) => (item.id === newItem.id ? newItem : item))
                );
                setEditItem(null);
              } else {
                setItems((prev) => [...prev, newItem]);
              }
            }}
          />

          <h3 className="mt-1">Other Information</h3>

          <MainForm
            edit={edit}
            items={items}
            setErr={setErr}
            onSuccess={onSuccess}
          />
        </>
      )}
    </div>
  );
};

const ItemForm = ({ edit, onSuccess }) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({ resolver: useYup(itemSchema) });

  useEffect(() => {
    reset({ ...edit });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (!edit) {
          values.id = Math.random().toString().substr(-8);
        }
        onSuccess(values);
        reset();
      })}
      className={`${s.itemForm} grid gap-1`}
    >
      <Input
        label="Product"
        {...register("name")}
        required
        error={errors.name}
      />
      <Input
        label="Price"
        type="number"
        required
        {...register("price")}
        error={errors.price}
      />
      <Input
        label="Qty"
        type="number"
        required
        {...register("qty")}
        error={errors.qty}
      />
      <Combobox
        label="Unit"
        name="unit"
        watch={watch}
        register={register}
        setValue={setValue}
        required
        clearErrors={clearErrors}
        options={[
          { label: "Piece", value: "PC" },
          { label: "KG", value: "KG" },
          { label: "Litter", value: "LT" },
          { label: "Gram", value: "GR" },
          { label: "ml", value: "ML" },
        ]}
        error={errors.unit}
      />
      <button className="btn">Add</button>
    </form>
  );
};

const MainForm = ({ edit, items, setErr, onSuccess }) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: useYup(mainSchema),
  });

  useEffect(() => {
    reset({ ...edit, date: moment(edit?.date, "YYYY-MM-DDThh:mm") });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (items.length < 1) {
          return setErr("Add at least one item");
        }
        onSuccess({
          ...values,
          items,
          id: edit?.id || Math.random().toString().substr(-8),
        });
      })}
      className={`${s.mainForm} grid gap-1`}
    >
      <Input
        label="Date & Time"
        type="datetime-local"
        {...register("date")}
        required
        error={errors.date}
      />
      <Input
        label="GST %"
        type="number"
        required
        {...register("gst")}
        error={errors.gst}
      />
      <div className="btns">
        <button className="btn">{edit ? "Update" : "Submit"}</button>
      </div>
    </form>
  );
};

export default Form;
