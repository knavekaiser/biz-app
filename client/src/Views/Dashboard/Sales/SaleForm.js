import { useState, useEffect, useContext, useRef } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import {
  Input,
  Textarea,
  Combobox,
  Table,
  TableActions,
  SearchField,
  moment,
} from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt } from "Components/modal";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import * as yup from "yup";
import s from "./sales.module.scss";
import { useReactToPrint } from "react-to-print";
import { endpoints } from "config";

import PrintInvoice from "./printInvoice";

const mainSchema = yup.object({
  date: yup.string().required(),
  gst: yup.number().required().typeError("Enter a valid Number"),
  customerName: yup.string().required(),
  customerDetail: yup.string().required(),
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
    .min(1, "Qty can not be less than 1")
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

const Detail = ({ label, value, className }) => {
  return (
    <p className={`${s.detail} ${className || ""}`}>
      <span className={s.label}>{label}:</span>{" "}
      <span className={s.value}>{value}</span>
    </p>
  );
};

const Form = ({ edit, sales, onSuccess }) => {
  const { user, config, checkPermission } = useContext(SiteContext);
  const [viewOnly, setViewOnly] = useState(!!edit);
  const [items, setItems] = useState(edit?.items || []);
  const [editItem, setEditItem] = useState(null);
  const [err, setErr] = useState(null);
  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });
  return (
    <div
      className={`grid gap-1 p-1 ${s.addSaleForm} ${
        viewOnly ? s.viewOnly : ""
      }`}
    >
      {viewOnly && (
        <div className={`flex wrap gap-1 ${s.saleDetail}`}>
          <div className="flex gap-1 all-columns justify-end align-center">
            {checkPermission("invoice_update") && (
              <button className="btn" onClick={() => setViewOnly(false)}>
                Edit
              </button>
            )}
            <button className="btn" onClick={handlePrint}>
              Print
            </button>
          </div>
          <div className={s.box}>
            <h3>Customer Information</h3>
            <Detail label="Name" value={edit.customer?.name} />
            <Detail
              label="Detail"
              value={
                edit.customer?.detail?.split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {arr[i + 1] && <br />}
                  </span>
                )) || null
              }
            />
          </div>
          <div className={s.box}>
            <h3>Invoice Information</h3>
            <Detail label="Status" value={edit.status} />
            <Detail
              label="Inv No"
              value={`${edit.no}${config?.print?.invoiceNoSuffix || ""}`}
              className="flex justify-space-between"
            />
            <Detail
              label="Date"
              value={moment(edit?.date, "DD-MM-YYYY")}
              className="flex justify-space-between"
            />
            <Detail
              label="Gross"
              value={edit.items
                .reduce((p, c) => p + c.qty * c.price, 0)
                .fix(2, config?.numberSeparator)}
              className="flex justify-space-between"
            />
            <Detail
              label="GST"
              value={edit.items
                .reduce((p, c) => p + c.qty * c.price, 0)
                .percent(edit?.gst || 0)
                .fix(2, config?.numberSeparator)}
              className="flex justify-space-between"
            />
            <Detail
              label="Total"
              value={(
                edit.items.reduce((p, c) => p + c.qty * c.price, 0) +
                edit.items
                  .reduce((p, c) => p + c.qty * c.price, 0)
                  .percent(edit.gst)
              ).fix(2, config?.numberSeparator)}
              className="flex justify-space-between"
            />
          </div>
        </div>
      )}

      <h3>Items</h3>
      {items.length > 0 ? (
        <Table
          className={s.items}
          columns={[
            { label: "Product" },
            { label: "Qty", className: "text-right" },
            { label: "Unit" },
            { label: "Rate", className: "text-right" },
            { label: "Total", className: "text-right" },
            ...(viewOnly ? [] : [{ label: "Action", action: true }]),
          ]}
        >
          {items.map((item, i) => (
            <tr key={i}>
              <td className={s.name}>
                <span className="ellipsis">{item.name}</span>
              </td>
              <td className="text-right">{item.qty}</td>
              <td>{item.unit}</td>
              <td className="text-right">
                {item.price.fix(2, config?.numberSeparator)}
              </td>
              <td className="text-right">
                {(item.price * item.qty).fix(2, config?.numberSeparator)}
              </td>
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
                              prev.filter((product) => product._id !== item._id)
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

      {edit && (
        <div style={{ display: "none" }}>
          <PrintInvoice ref={printRef} sale={edit} user={user} />
        </div>
      )}

      {!viewOnly && (
        <>
          <ItemForm
            key={editItem ? "edit" : "add"}
            edit={editItem}
            sales={sales}
            onSuccess={(newItem) => {
              setErr(null);
              if (editItem) {
                setItems((prev) =>
                  prev.map((item) =>
                    item._id === newItem._id ? newItem : item
                  )
                );
                setEditItem(null);
              } else {
                setItems((prev) => [...prev, newItem]);
              }
            }}
          />

          <h3 className="mt-1">Other Information</h3>

          <MainForm
            disabled={editItem}
            edit={edit}
            items={items}
            sales={sales}
            setErr={setErr}
            onSuccess={onSuccess}
            setViewOnly={setViewOnly}
          />
        </>
      )}
    </div>
  );
};

const ItemForm = ({ edit, sales, onSuccess }) => {
  const { config } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      unit: "Piece",
    },
    resolver: useYup(itemSchema),
  });
  useEffect(() => {
    reset({ ...edit });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (!edit) {
          values._id = Math.random().toString().substr(-8);
        }
        onSuccess(values);
        reset();
      })}
      className={`${s.itemForm} grid gap-1`}
    >
      <SearchField
        label="Product"
        data={sales
          .reduce((p, c) => [...p, ...c.items], [])
          .map((item) => ({
            label: item.name,
            value: item.name,
            data: item,
          }))}
        register={register}
        name="name"
        formOptions={{ required: true }}
        renderListItem={(item) => <>{item.label}</>}
        watch={watch}
        setValue={setValue}
        onChange={(item) => {
          if (typeof item === "string") {
            setValue("name", item);
          } else {
            setValue("name", item.name);
            setValue("price", item.price);
          }
        }}
        error={errors.name}
        className={s.itemName}
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
        control={control}
        formOptions={{ required: true }}
        options={config.unitsOfMeasure.map((unit) => ({
          label: unit,
          value: unit,
        }))}
      />
      <button className="btn">{edit ? "Update" : "Add"}</button>
    </form>
  );
};

const MainForm = ({ disabled, edit, items, sales, setErr, onSuccess }) => {
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: useYup(mainSchema),
  });

  const {
    post: saveInvoice,
    put: updateInvoice,
    loading,
  } = useFetch(endpoints.invoices + `/${edit?._id || ""}`);

  useEffect(() => {
    reset({
      ...edit,
      // status: edit?.status || "pending",
      date: moment(edit?.date, "YYYY-MM-DD"),
      customerName: edit?.customer?.name || "",
      customerDetail: edit?.customer?.detail || "",
    });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (items.length < 1) {
          return setErr("Add at least one item");
        }

        (edit ? updateInvoice : saveInvoice)({
          dateTime: values.date,
          gst: values.gst,
          // status: values.status,
          customer: {
            name: values.customerName,
            detail: values.customerDetail,
          },
          items: items.map((item) => ({ ...item, _id: undefined })),
        })
          .then(({ data }) => {
            if (!data.success) {
              return Prompt({ type: "error", message: data.message });
            }
            onSuccess(data.data);
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
      className={`${s.mainForm} grid gap-1`}
    >
      <Input
        label="Date"
        type="date"
        {...register("date")}
        required
        error={errors.date}
      />

      {/* <Combobox
        label="Status"
        name="status"
        control={control}
        options={[
          { label: "Pending", value: "pending" },
          { label: "Due", value: "due" },
          { label: "Cancelled", value: "cancelled" },
        ]}
      /> */}

      <Input
        label="GST %"
        type="number"
        required
        {...register("gst")}
        error={errors.gst}
      />

      <div className="all-columns">
        <h3>Customer Information</h3>
      </div>

      <SearchField
        label="Name"
        data={[...new Set(sales.map((item) => item.customer.name))].map(
          (name) => ({
            label: name,
            value: name,
            data: sales.find((item) => item.customer.name === name)?.customer,
          })
        )}
        register={register}
        name="customerName"
        formOptions={{ required: true }}
        renderListItem={(item) => <>{item.label}</>}
        watch={watch}
        setValue={setValue}
        onChange={(item) => {
          if (typeof item === "string") {
            setValue("customerName", item);
          } else {
            setValue("customerName", item.name);
            setValue("customerDetail", item.detail);
          }
        }}
        error={errors.customerName}
      />

      <Textarea
        label="Detail"
        {...register("customerDetail")}
        required
        error={errors["customerDetail"]}
      />

      <div className="btns">
        {
          //   <button
          //   type="button"
          //   onClick={() => setViewOnly(true)}
          //   className="btn"
          //   disabled={disabled || loading}
          // >
          //   Cancel
          // </button>
        }
        <button className="btn" disabled={disabled || loading}>
          {edit ? "Update" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default Form;
