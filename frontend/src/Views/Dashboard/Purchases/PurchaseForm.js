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
  Select,
} from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt } from "Components/modal";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import * as yup from "yup";
import s from "./purchases.module.scss";
import { useReactToPrint } from "react-to-print";
import { endpoints } from "config";

import PrintInvoice from "./printInvoice";

const mainSchema = yup.object({
  date: yup.string().required(),
  gst: yup.number().required().typeError("Enter a valid Number"),
  accountId: yup.string().required(),
  // vendorName: yup.string().required(),
  vendorDetail: yup.string().required(),
});

const itemSchema = yup.object({
  product_id: yup.string().required(),
  product_name: yup.string().required(),
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

const Form = ({ edit, purchases, onSuccess }) => {
  const { user, config, checkPermission } = useContext(SiteContext);
  const { control, watch, reset } = useForm();
  const [viewOnly, setViewOnly] = useState(!!edit);
  const [items, setItems] = useState(edit?.items || []);
  const [editItem, setEditItem] = useState(null);
  const [err, setErr] = useState(null);
  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const location = watch("branch");
  useEffect(() => {
    reset({ branch: edit?.branch || "" });
  }, [edit]);
  return (
    <div
      className={`grid gap-1 p-1 ${s.addPurchaseForm} ${
        viewOnly ? s.viewOnly : ""
      }`}
    >
      {viewOnly && (
        <div className={`flex wrap gap-1 ${s.purchaseDetail}`}>
          <div className="flex gap-1 all-columns justify-end align-center">
            {checkPermission("purchase_update") && (
              <button className="btn" onClick={() => setViewOnly(false)}>
                Edit
              </button>
            )}
            <button className="btn" onClick={handlePrint}>
              Print
            </button>
          </div>
          <div className={s.box}>
            <h3>Account Information</h3>
            <Detail
              label="Name"
              value={edit.accountingEntries?.[0]?.accountName}
            />
            <Detail
              label="Detail"
              value={
                edit.vendor?.detail?.split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {arr[i + 1] && <br />}
                  </span>
                )) || null
              }
            />
          </div>
          <div className={s.box}>
            <h3>Purchase Information</h3>
            <Detail
              label="Inv No"
              className="flex justify-space-between"
              value={`${edit.no}${config?.print?.purchaseNoSuffix || ""}`}
            />
            <Detail
              className="flex justify-space-between"
              label="Date"
              value={moment(edit?.dateTime, "DD-MM-YYYY")}
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

      {!viewOnly && (
        <Select
          label="Branch"
          control={control}
          name="branch"
          formOptions={{ required: true }}
          url={endpoints.inventoryBranches}
          getQuery={(v) => ({
            name: v,
          })}
          handleData={(data) => ({
            label: `${data.name}`,
            value: data._id,
          })}
        />
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
                <span className="ellipsis">{item.product?.name}</span>
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
                      onClick: () => setEditItem(item),
                    },
                    {
                      icon: <FaRegTrashAlt />,
                      label: "Delete",
                      onClick: () =>
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
          <PrintInvoice ref={printRef} purchase={edit} user={user} />
        </div>
      )}

      {!viewOnly && (
        <>
          <ItemForm
            location={location}
            key={editItem ? "edit" : "add"}
            edit={editItem}
            purchases={purchases}
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
            location={location}
            disabled={editItem}
            edit={edit}
            items={items}
            purchases={purchases}
            setErr={setErr}
            onSuccess={onSuccess}
            setViewOnly={setViewOnly}
          />
        </>
      )}
    </div>
  );
};

const ItemForm = ({ location, edit, purchases, onSuccess }) => {
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
    reset({
      ...edit,
      product_id: edit?.product?._id || "",
      product_name: edit?.product?.name || "",
    });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (!edit) {
          values._id = Math.random().toString().substr(-8);
        }
        onSuccess({
          ...values,
          product: {
            _id: values.product_id,
            name: values.product_name,
          },
        });
        reset();
      })}
      className={`${s.itemForm} grid gap-1`}
    >
      <Select
        control={control}
        url={endpoints.inventoryMasters}
        getQuery={(v) => ({
          branch: location,
          isGroup: "false",
          name: v,
        })}
        handleData={(data) => ({
          label: `${data.name}`,
          value: data._id,
          account: data,
        })}
        label="Product"
        name="product_id"
        formOptions={{ required: true }}
        onChange={(opt) => {
          if (opt) {
            setValue("product_name", opt.label);
          }
        }}
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
        control={control}
        name="unit"
        formOptions={{ required: true }}
        options={config?.unitsOfMeasure.map((unit) => ({
          label: unit,
          value: unit,
        }))}
      />
      <button className="btn">{edit ? "Update" : "Add"}</button>
    </form>
  );
};

const MainForm = ({
  location,
  disabled,
  edit,
  items,
  purchases,
  setErr,
  onSuccess,
  setViewOnly,
}) => {
  const { finPeriod } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: useYup(mainSchema),
  });

  const {
    post: saveInvoice,
    put: updateInvoice,
    loading,
  } = useFetch(endpoints.purchases + `/${edit?._id || ""}`);

  useEffect(() => {
    let date = edit?.dateTime ? new Date(edit?.dateTime) : new Date();
    if (finPeriod && date < new Date(finPeriod.startDate)) {
      date = finPeriod.startDate;
    } else if (finPeriod && date > new Date(finPeriod.endDate)) {
      date = finPeriod.endDate;
    }
    reset({
      ...edit,
      date: moment(date, "YYYY-MM-DD"),
      accountId: edit?.accountingEntries?.[0]?.accountId || "",
      accountName: edit?.accountingEntries?.[0]?.accountName || "",
      // vendorName: edit?.vendor?.name || "",
      vendorDetail: edit?.vendor?.detail || "",
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
          accountId: values.accountId,
          accountName: values.accountName,
          branch: location,
          vendor: {
            //   name: values.vendorName,
            detail: values.vendorDetail,
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
        {...(finPeriod && {
          min: moment(finPeriod.startDate, "YYYY-MM-DD"),
          max: moment(finPeriod.endDate, "YYYY-MM-DD"),
        })}
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

      <div className="all-columns">
        <h3>Account Information</h3>
      </div>

      <Select
        label="Supplier Account"
        control={control}
        name="accountId"
        formOptions={{ required: true }}
        url={endpoints.accountingMasters}
        getQuery={(v) => ({
          types: "Cash,Bank,Suppliers",
          isGroup: "false",
          name: v,
        })}
        handleData={(data) => ({
          label: `${data.name}${data.type ? ` - ${data.type}` : ""}`,
          value: data._id,
          account: data,
        })}
        onChange={(opt) => {
          setValue("accountName", opt.account?.name);
        }}
      />

      <Textarea
        label="Detail"
        {...register("vendorDetail")}
        required
        error={errors["vendorDetail"]}
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
