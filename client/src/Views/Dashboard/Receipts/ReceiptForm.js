import { useState, useEffect, useContext, useRef, useCallback } from "react";
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
import s from "./receipts.module.scss";
import { useReactToPrint } from "react-to-print";
import { endpoints } from "config";

import PrintInvoice from "./printInvoice";

const mainSchema = yup.object({
  date: yup.string().required(),
  type: yup.string().required(),
  amount: yup
    .number()
    .min(1, "Enter more than 0")
    .required()
    .typeError("Enter a valid amount"),
  customerName: yup.string().required("Customer name is a required field"),
  customerDetail: yup.string().required("Customer detail is a required field"),
});

const itemSchema = yup.object({
  no: yup.string().required(),
  amount: yup
    .number()
    .min(0, "Price can not be less than 0")
    .required()
    .typeError("Enter a valid Number"),
  net: yup.number(),
  due: yup.number(),
});

const Detail = ({ label, value, className }) => {
  return (
    <p className={`${s.detail} ${className || ""}`}>
      <span className={s.label}>{label}:</span>{" "}
      <span className={s.value}>{value}</span>
    </p>
  );
};

const Form = ({ edit, receipts, onSuccess }) => {
  const { user, config } = useContext(SiteContext);
  const [viewOnly, setViewOnly] = useState(!!edit);
  const [items, setItems] = useState(edit?.invoices || []);
  const [err, setErr] = useState(null);
  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });
  return (
    <div
      className={`grid gap-1 p-1 ${s.addReceiptForm} ${
        viewOnly ? s.viewOnly : ""
      }`}
    >
      {viewOnly && (
        <div className={`flex wrap gap-1 ${s.receiptDetail}`}>
          <div className="flex gap-1 all-columns justify-end align-center">
            <button className="btn" onClick={() => setViewOnly(false)}>
              Edit
            </button>
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
            <h3>Receipt Information</h3>
            <Detail
              label="Inv No"
              value={`${edit.no}${config.print?.receiptNoSuffix || ""}`}
            />
            <Detail label="Date" value={moment(edit?.date, "DD-MM-YYYY")} />
            <Detail
              label="Amount"
              value={edit.amount.fix(2, config?.numberSeparator)}
              className="flex justify-space-between"
            />
            <Detail
              label="Adjusted"
              value={edit.invoices
                .reduce((p, c) => p + c.amount, 0)
                .fix(2, config?.numberSeparator)}
              className="flex justify-space-between"
            />
          </div>
        </div>
      )}

      {err && <p className="error">{err}</p>}

      {false && edit && (
        <div style={{ display: "none" }}>
          <PrintInvoice ref={printRef} receipt={edit} user={user} />
        </div>
      )}

      {!viewOnly && (
        <>
          <h3>Receipt Information</h3>

          <MainForm
            edit={edit}
            items={items}
            setItems={setItems}
            receipts={receipts}
            setErr={setErr}
            onSuccess={onSuccess}
            setViewOnly={setViewOnly}
          />
        </>
      )}
    </div>
  );
};

const ItemForm = ({ edit, receipts, onSuccess }) => {
  const { config } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    clearErrors,
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
        if (values.amount > values.due) {
          return Prompt({
            type: "error",
            message: `Enter an amount less or equal to ${values.due}`,
          });
        }
        onSuccess(values);
        reset();
      })}
      className={`${s.itemForm} grid gap-1`}
    >
      <SearchField
        label="Invoice No."
        url={endpoints.invoices}
        getQuery={(v) => ({
          no: v,
        })}
        processData={(data, vlaue) => {
          return (data?.data || [])
            .filter((item) => item.due)
            .map((item) => ({
              ...item,
              net:
                item.items.reduce((p, c) => p + c.qty * c.price, 0) +
                item.items
                  .reduce((p, c) => p + c.qty * c.price, 0)
                  .percent(item.gst),
            }));
        }}
        register={register}
        name="no"
        formOptions={{ required: true }}
        renderListItem={(item) => (
          <>
            {item.no}. Net: {item.net}; Due: {item.due}
          </>
        )}
        watch={watch}
        setValue={setValue}
        custom
        onChange={(item) => {
          if (typeof item === "string") {
          } else {
            setValue("no", item.no);
            setValue("due", item.due);
            setValue("net", item.net);
          }
        }}
        error={errors.name}
        type="number"
        className={s.itemName}
      />

      <Input label="Net" type="number" {...register("net")} readOnly />
      <Input label="Due" type="number" {...register("due")} readOnly />

      <Input
        label="Amount"
        type="number"
        step="0.01"
        required
        {...register("amount")}
        error={errors.amount}
      />

      <button className="btn">Add</button>
    </form>
  );
};

const MainForm = ({
  edit,
  items,
  setItems,
  receipts,
  setErr,
  onSuccess,
  setViewOnly,
}) => {
  const { config, setConfig } = useContext(SiteContext);
  const [adjustInvoice, setAdjustInvoice] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: useYup(mainSchema),
  });

  const { post: saveInvoice, put: updateInvoice, loading } = useFetch(
    endpoints.receipts + `/${edit?._id || ""}`
  );

  const submitForm = useCallback((values) => {
    if (items.length > 0) {
      const totalNet = items.reduce((p, c) => p + c.net, 0);
      const totalAmount = items.reduce((p, c) => p + c.amount, 0);
      const totalDue = items.reduce((p, c) => p + c.due, 0);
      if (totalAmount > values.amount) {
        return Prompt({
          type: "error",
          message: `Adjusted amount (${totalAmount}) can not be more than the receipt amount.`,
        });
      }
      if (totalAmount < values.amount) {
        return Prompt({
          type: "error",
          message: `Please add another invoice or reduce the receipt amount.`,
        });
      }
      if (values.amount > totalDue) {
        return Prompt({
          type: "error",
          message: `Amount must be less or equal to ${totalDue}. Please reduce the amount or add another invoice.`,
        });
      }
    }
    console.log(values);
    (edit ? updateInvoice : saveInvoice)({
      dateTime: values.date,
      amount: values.amount,
      type: values.type,
      customer: {
        name: values.customerName,
        detail: values.customerDetail,
      },
      invoices: items.map((item) => ({ ...item, _id: undefined })),
    }).then(({ data }) => {
      if (data.errors) {
        return Prompt({ type: "error", message: data.message });
      } else if (data.success) {
        onSuccess(data.data);
      }
    });
  }, []);

  useEffect(() => {
    reset({
      ...edit,
      date: moment(edit?.date, "YYYY-MM-DD"),
      customerName: edit?.customer?.name || "",
      customerDetail: edit?.customer?.detail || "",
    });
  }, [edit]);
  return (
    <div className={`${s.mainForm} grid gap-1`}>
      <form
        className={`${s.mainFormWrapper} grid gap-1 all-columns`}
        onSubmit={handleSubmit(submitForm)}
      >
        <Input
          label="Date"
          type="date"
          {...register("date")}
          required
          error={errors.date}
        />

        <Combobox
          label="Type"
          name="type"
          watch={watch}
          register={register}
          setValue={setValue}
          required
          clearErrors={clearErrors}
          options={[
            { label: "Cash", value: "Cash" },
            { label: "Bank Transfer", value: "Bank Transfer" },
          ]}
          error={errors.type}
        />

        <Input
          label="Amount"
          type="number"
          step="0.01"
          required
          {...register("amount")}
          error={errors.amount}
        />

        <div className="all-columns">
          <h3>Customer Information</h3>
        </div>

        <SearchField
          label="Name"
          data={receipts.map((item) => ({
            label: item.customer.name,
            value: item.customer.name,
            data: item.customer,
          }))}
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
      </form>

      <div className="all-columns flex justify-center">
        <button
          className="btn"
          onClick={() => {
            setAdjustInvoice(!adjustInvoice);
            setItems([]);
          }}
        >
          {adjustInvoice ? "Clear" : "Adjust"} Invoices
        </button>
      </div>

      {adjustInvoice && (
        <>
          <h3>Invoices</h3>{" "}
          <ItemForm
            key={editItem ? "edit" : "add"}
            edit={editItem}
            receipts={receipts}
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
                if (
                  items.some(
                    (item) => item.no.toString() === newItem.no.toString()
                  )
                ) {
                  return Prompt({
                    type: "error",
                    message: "Invoice has already been added.",
                  });
                }
                setItems((prev) => [...prev, newItem]);
              }
            }}
          />
          {items.length > 0 ? (
            <Table
              className={s.items}
              columns={[
                { label: "Invoice No." },
                { label: "Net", className: "text-right" },
                { label: "Due", className: "text-right" },
                { label: "Amount", className: "text-right" },
                { label: "Action", action: true },
              ]}
            >
              {items.map((item, i) => (
                <tr key={i}>
                  <td className={s.name}>
                    <span className="ellipsis">{item.no}</span>
                  </td>
                  <td className="text-right">
                    {item.net?.fix(2, config?.numberSeparator)}
                  </td>
                  <td className="text-right">
                    {item.due?.fix(2, config?.numberSeparator)}
                  </td>
                  <td className="text-right">
                    {item.amount.fix(2, config?.numberSeparator)}
                  </td>
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
                                prev.filter(
                                  (product) => product._id !== item._id
                                )
                              );
                            },
                          }),
                      },
                    ]}
                  />
                </tr>
              ))}
            </Table>
          ) : (
            <p className={s.noContent}>No invoices selected.</p>
          )}
        </>
      )}

      <form
        className={`${s.btnsWrapper} grid gap-1 all-columns`}
        onSubmit={handleSubmit(submitForm)}
      >
        <div className="btns">
          <button className="btn" disabled={editItem || loading}>
            {edit ? "Update" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;
