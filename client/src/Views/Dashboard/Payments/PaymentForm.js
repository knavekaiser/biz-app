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
  Select,
  Tabs,
  moment,
  Moment,
} from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt } from "Components/modal";
import { FaPencilAlt, FaRegTrashAlt, FaTimes, FaCheck } from "react-icons/fa";
import * as yup from "yup";
import s from "./payments.module.scss";
import { useReactToPrint } from "react-to-print";
import { endpoints } from "config";

import PrintPurchase from "./printPurchase";

const mainSchema = yup.object({
  date: yup.string().required(),
  type: yup.string().required(),
  amount: yup
    .number()
    .min(1, "Enter more than 0")
    .required()
    .typeError("Enter a valid amount"),
  vendorName: yup.string().required("Vendor name is a required field"),
  vendorDetail: yup.string().required("Vendor detail is a required field"),
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

const Form = ({ edit, payments, onSuccess }) => {
  const { user, config, checkPermission } = useContext(SiteContext);
  const [viewOnly, setViewOnly] = useState(!!edit);
  const [items, setItems] = useState(edit?.purchases || []);
  const [err, setErr] = useState(null);
  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const [purchases, setPurchases] = useState([]);

  const { get: getPurchases } = useFetch(endpoints.purchases);

  useEffect(() => {
    getPurchases().then(({ data }) => {
      if (data?.success) {
        setPurchases(
          data.data.map((item) => ({
            ...item,
            due: item.due.fix(2),
            net:
              item.items.reduce((p, c) => p + c.qty * c.price, 0) +
              item.items
                .reduce((p, c) => p + c.qty * c.price, 0)
                .percent(item.gst),
          }))
        );
      }
    });
  }, []);

  return (
    <div
      className={`grid gap-1 p-1 ${s.addPaymentForm} ${
        viewOnly ? s.viewOnly : ""
      }`}
    >
      {viewOnly && (
        <div className={`flex wrap gap-1 ${s.paymentDetail}`}>
          <div className="flex gap-1 all-columns justify-end align-center">
            {checkPermission("payment_update") && (
              <button className="btn" onClick={() => setViewOnly(false)}>
                Edit
              </button>
            )}
            {
              //   <button className="btn" onClick={handlePrint}>
              //   Print
              // </button>
            }
          </div>
          <div className={s.box}>
            <h3>Vendor Information</h3>
            <Detail label="Name" value={edit.vendor?.name} />
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
            <h3>Payment Information</h3>
            <Detail
              label="Inv No"
              value={`${edit.no}${config.print?.paymentNoSuffix || ""}`}
            />
            <Detail label="Date" value={moment(edit?.date, "DD-MM-YYYY")} />
            <Detail
              label="Amount"
              value={edit.amount.fix(2, config?.numberSeparator)}
              className="flex justify-space-between"
            />
            <Detail
              label="Adjusted"
              value={edit.purchases
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
          <PrintPurchase ref={printRef} payment={edit} user={user} />
        </div>
      )}

      {!viewOnly && (
        <>
          <h3>Payment Information</h3>

          <MainForm
            purchases={
              purchases
              //   .filter(
              //   (inv) => !items.some((item) => item.no === inv.no)
              // )
            }
            edit={edit}
            items={items}
            setItems={setItems}
            payments={payments}
            setErr={setErr}
            onSuccess={onSuccess}
            setViewOnly={setViewOnly}
          />
        </>
      )}
    </div>
  );
};

const ItemForm = ({ edit, setEdit, payments, purchases, onSuccess }) => {
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
        if (values.amount > values.due) {
          return Prompt({
            type: "error",
            message: `Enter an amount less or equal to ${values.due}`,
          });
        }
        values.no = +values.no;
        onSuccess(values);
        reset();
      })}
      className={`${s.itemForm} grid gap-1`}
    >
      <Select
        control={control}
        label="Purchase No."
        options={purchases
          .filter((item) => item.due)
          .map((item) => ({
            label: `${item.no}. ${moment(item.dateTime, "DD-MM-YY")} Due: ${
              item.due
            }`,
            value: item.no,
            data: item,
          }))}
        name="no"
        formOptions={{ required: true }}
        onChange={(item) => {
          if (typeof item === "string") {
          } else {
            setValue("no", item.data.no);
            setValue("due", item.data.due);
            setValue("net", item.data.net);
          }
        }}
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

      {edit ? (
        <div className={`flex ${s.btns}`}>
          <button type="submit">
            <FaCheck />
          </button>
          <button type="button" onClick={() => setEdit(null)}>
            <FaTimes />
          </button>
        </div>
      ) : (
        <button className="btn">Add</button>
      )}
    </form>
  );
};

const MainForm = ({
  purchases,
  edit,
  items,
  setItems,
  payments,
  setErr,
  onSuccess,
  setViewOnly,
}) => {
  const { config, setConfig } = useContext(SiteContext);
  const [adjustPurchase, setAdjustPurchase] = useState(
    !!edit?.purchases?.length
  );
  const [editItem, setEditItem] = useState(null);
  const [adjustPurchaseTab, setAdjustPurchaseTab] = useState("table");
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
    post: savePayment,
    put: updatePayment,
    loading,
  } = useFetch(endpoints.payments + `/${edit?._id || ""}`);

  const submitForm = useCallback(
    (values) => {
      if (items.length > 0) {
        const totalNet = items.reduce((p, c) => p + c.net, 0);
        const totalAmount = items.reduce((p, c) => p + c.amount, 0);
        const totalDue = items.reduce((p, c) => p + c.due, 0);
        if (totalAmount > values.amount) {
          return Prompt({
            type: "error",
            message: `Adjusted amount (${totalAmount}) can not be more than the payment amount.`,
          });
        }
        // if (totalAmount < values.amount) {
        //   return Prompt({
        //     type: "error",
        //     message: `Please add another purchase or reduce the payment amount. Total adjusted amount ${totalAmount}`,
        //   });
        // }
        // if (values.amount > totalDue) {
        //   return Prompt({
        //     type: "error",
        //     message: `Amount must be less or equal to ${totalDue}. Please reduce the amount or add another purchase.`,
        //   });
        // }
      }
      (edit ? updatePayment : savePayment)({
        dateTime: values.date,
        amount: values.amount,
        type: values.type,
        vendor: {
          name: values.vendorName,
          detail: values.vendorDetail,
        },
        purchases: items.map((item) => ({ ...item, _id: undefined })),
      }).then(({ data }) => {
        if (data.errors) {
          return Prompt({ type: "error", message: data.message });
        } else if (data.success) {
          onSuccess(data.data);
        }
      });
    },
    [items]
  );

  const vendorName = watch("vendorName");

  useEffect(() => {
    reset({
      ...edit,
      date: moment(edit?.date, "YYYY-MM-DD"),
      vendorName: edit?.vendor?.name || "",
      vendorDetail: edit?.vendor?.detail || "",
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
          control={control}
          formOptions={{ required: true }}
          options={[
            { label: "Cash", value: "Cash" },
            { label: "Bank Transfer", value: "Bank Transfer" },
          ]}
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
          <h3>Vendor Information</h3>
        </div>

        <Select
          disabled={edit}
          control={control}
          label="Name"
          options={purchases.map((item) => ({
            label: item.vendor.name,
            value: item.vendor.name,
            data: item.vendor,
          }))}
          name="vendorName"
          formOptions={{ required: true }}
          renderListItem={(item) => <>{item.label}</>}
          onChange={(item) => {
            setValue("vendorName", item.data.name);
            setValue("vendorDetail", item.data.detail);
            setItems([]);
          }}
        />

        <Textarea label="Detail" readOnly {...register("vendorDetail")} />
      </form>

      <div className="all-columns flex justify-center">
        <button
          className="btn"
          onClick={() => {
            setAdjustPurchase(!adjustPurchase);
            setItems([]);
          }}
        >
          {adjustPurchase ? "Clear" : "Adjust"} Purchases
        </button>
      </div>

      {adjustPurchase && (
        <>
          <h3>Adjusted Purchases</h3>
          <Tabs
            secondary
            activeTab={adjustPurchaseTab}
            onChange={(tab) => setAdjustPurchaseTab(tab.value)}
            tabs={[
              {
                label: "Purchase Table",
                value: "table",
              },
              {
                label: "Search Purchase",
                value: "search",
              },
            ]}
          />
        </>
      )}

      {adjustPurchase &&
        adjustPurchaseTab === "table" &&
        (purchases.filter(
          (purchase) =>
            purchase.vendor.name === vendorName &&
            (items.some((item) => item.no === purchase.no) || purchase.due)
        ).length > 0 ? (
          <Table
            className={s.purchaseTable}
            columns={[
              { label: "Purchase No" },
              { label: "Date" },
              { label: "Vendor" },
              { label: "Net", className: "text-right" },
              { label: "Due", className: "text-right" },
              { label: "Adjust" },
            ]}
          >
            {purchases
              .filter(
                (purchase) =>
                  purchase.vendor.name === vendorName &&
                  (items.some((item) => item.no === purchase.no) ||
                    purchase.due)
              )
              .map((purchase) => (
                <SinglePurchaseAdjustTr
                  purchase={purchase}
                  key={purchase._id}
                  config={config}
                  items={items}
                  setItems={setItems}
                />
              ))}
          </Table>
        ) : (
          <p className={s.noContent}>
            No pending purchase from selected vendor.
          </p>
        ))}

      {adjustPurchase && adjustPurchaseTab === "search" && (
        <>
          <ItemForm
            purchases={purchases.filter(
              (item) => item.vendor.name === vendorName
            )}
            key={editItem ? "edit" : "add"}
            edit={editItem}
            setEdit={setEditItem}
            payments={payments}
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
                    message: "Purchase has already been added.",
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
                { label: "Purchase No." },
                // { label: "Net", className: "text-right" },
                // { label: "Due", className: "text-right" },
                { label: "Amount", className: "text-right" },
                { label: "Action", action: true },
              ]}
            >
              {items.map((item, i) => (
                <tr key={i}>
                  <td className={s.name}>
                    <span className="ellipsis">{item.no}</span>
                  </td>
                  {
                    //   <td className="text-right">
                    //   {item.net?.fix(2, config?.numberSeparator)}
                    // </td>
                    // <td className="text-right">
                    //   {item.due?.fix(2, config?.numberSeparator)}
                    // </td>
                  }
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
            <p className={s.noContent}>No purchases selected.</p>
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

const SinglePurchaseAdjustTr = ({ purchase, items, setItems, config }) => {
  const [adjust, setAdjust] = useState(
    items.find((item) => item.no === purchase.no)?.amount || ""
  );
  useEffect(() => {
    setAdjust(items.find((item) => item.no === purchase.no)?.amount || "");
  }, [items]);
  return (
    <tr>
      <td>
        {purchase.no}
        {config?.print?.purchaseNoSuffix || ""}
      </td>
      <td className={s.date}>
        <Moment format="DD/MM/YYYY">{purchase.date}</Moment>
      </td>
      <td className={s.vendor}>{purchase.vendor?.name}</td>
      <td className={`text-right ${s.net}`}>
        {purchase.net.fix(2, config?.numberSeparator)}
      </td>
      <td className={`text-right ${s.net}`}>
        {purchase.due.fix(2, config?.numberSeparator)}
      </td>
      <td>
        <Input
          placeholder="Adjust"
          type="number"
          onBlur={(e) => {
            const value = +e.target.value || 0;
            if (value <= 0) {
              e.target.value = "";
              setItems((prev) => [
                ...prev.filter((item) => item.no !== purchase.no),
              ]);
              return;
            }
            if (purchase.due) {
              setItems((prev) => [
                ...prev.filter((item) => item.no !== purchase.no),
                {
                  _id: Math.random().toString().substr(-8),
                  no: purchase.no,
                  due: purchase.due,
                  net: purchase.net,
                  amount: Math.min(value, purchase.due),
                },
              ]);
            }
          }}
          value={adjust}
          onChange={(e) => setAdjust(e.target.value)}
        />
      </td>
    </tr>
  );
};

export default Form;
