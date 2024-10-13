import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input, Combobox } from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt } from "Components/modal";
import * as yup from "yup";
import s from "./quotes.module.scss";
import { endpoints } from "config";
import { RiCloseLargeFill } from "react-icons/ri";

const mainSchema = yup.object({
  name: yup.string().required("Please enter a name"),
  parent: yup.string(),
  type: yup
    .string()
    .oneOf([
      "Cash",
      "Bank",
      "Customers",
      "Suppliers",
      "Sales",
      "Purchase",
      "Stock",
      "null",
      "Tax",
      null,
    ])
    .nullable(),
  isGroup: yup.boolean().required(),
});

const Form = ({ edit, masters = [], onSuccess }) => {
  const [entries, setEntries] = useState([]);
  const {
    handleSubmit,
    register,
    reset,
    control,
    setValue,
    setError,
    setFocus,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: useYup(mainSchema),
  });

  const {
    post: createMaster,
    put: updateMaster,
    loading,
  } = useFetch(endpoints.inventoryMasters + `/${edit?._id || ""}`);

  useEffect(() => {
    const values = {
      name: edit?.name || "",
      parent: edit?.parent || "null",
      type: edit?.type || "null",
      isGroup: edit?.isGroup ?? true,
    };
    if (edit?.openingStocks?.length) {
      edit?.openingStocks?.forEach((entry, i) => {
        values[`entries_${i}_branch`] = entry.branch;
        values[`entries_${i}_amount`] = entry.amount;
      });
    } else {
      values.entries_0_branch = "";
      values.entries_0_amount = "";
    }
    reset(values);
    setEntries(
      edit?.openingStocks?.length
        ? edit?.openingStocks
        : [
            {
              _id: Math.random().toString(36),
              name: "",
              amount: "",
            },
          ]
    );
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (
          entries.some((entry, i) => {
            if (entry.branch && entry.amount) {
              return false;
            }
            if (!entry.branch) {
              setError(`entries_${i}_branch`, {
                type: "custom",
                message: "Name is required.",
              });
            }
            if (!entry.amount) {
              setError(`entries_${i}_amount`, {
                type: "custom",
                message: "Amount is required.",
              });
            }
            return true;
          })
        ) {
          return;
        }

        if (values.parent === "null") {
          values.parent = null;
        }
        if (values.type === "null") {
          values.type = null;
        }

        const payload = {
          name: values.name,
          isGroup: values.isGroup,
          parent: values.parent,
          type: values.type,
          openingStocks: entries.map((entry) => ({
            branch: entry.branch,
            amount: entry.amount,
          })),
        };
        (edit?._id ? updateMaster : createMaster)(payload)
          .then(({ data }) => {
            if (!data.success) {
              return Prompt({ type: "error", message: data.message });
            }
            onSuccess(data.data);
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
      className={`${s.masterForm} grid gap-1`}
    >
      <Input label="Name" {...register("name")} required error={errors.name} />

      <Combobox
        label="Parent"
        name="parent"
        control={control}
        options={[
          { label: "None", value: "null" },
          ...masters.map((item) => ({ label: item.name, value: item._id })),
        ]}
      />

      <Combobox
        label="Type"
        name="type"
        control={control}
        options={[
          { label: "None", value: "null" },
          { label: "Cash", value: "Cash" },
          { label: "Bank", value: "Bank" },
          { label: "Customers", value: "Customers" },
          { label: "Suppliers", value: "Suppliers" },
          { label: "Sales", value: "Sales" },
          { label: "Purchase", value: "Purchase" },
          { label: "Stock", value: "Stock" },
          { label: "Tax", value: "Tax" },
        ]}
      />

      <Combobox
        label="Is Group"
        name="isGroup"
        control={control}
        formOptions={{ required: true }}
        options={[
          { label: "No", value: false },
          { label: "Yes", value: true },
        ]}
      />

      <h3>Opening Stocks</h3>

      {(entries || []).map((entry, i) => (
        <div key={entry._id} className={s.entryForm}>
          <Input
            label="Branch Name"
            required
            {...register(`entries_${i}_branch`)}
            onChange={(e) => {
              clearErrors(`entries_${i}_branch`);
              setEntries((prev) =>
                prev.map((item) =>
                  item._id === entry._id
                    ? { ...item, branch: e.target.value }
                    : item
                )
              );
            }}
            error={errors[`entries_${i}_branch`]}
          />
          <Input
            label="Amount"
            type="number"
            required
            {...register(`entries_${i}_amount`)}
            onChange={(e) => {
              clearErrors(`entries_${i}_amount`);
              setEntries((prev) =>
                prev.map((item) =>
                  item._id === entry._id
                    ? { ...item, amount: e.target.value }
                    : item
                )
              );
            }}
            error={errors[`entries_${i}_amount`]}
          />

          {entries?.length > 1 && (
            <button
              type="button"
              onClick={() =>
                setEntries((prev) =>
                  prev.filter((item) => item._id !== entry._id)
                )
              }
              className="btn clear iconOnly"
            >
              <RiCloseLargeFill />
            </button>
          )}
        </div>
      ))}

      {!loading && (
        <button
          type="button"
          className="btn secondary"
          onClick={() => {
            setValue(`entries_${entries.length}_type`, "credit");
            setEntries((prev) => [
              ...prev,
              {
                _id: Math.random().toString(36),
                type: "credit",
                accountId: "",
                debit: "",
                credit: "",
              },
            ]);
          }}
        >
          Add More Stock
        </button>
      )}

      <div className="btns">
        <button className="btn" disabled={loading}>
          {edit?._id ? "Update" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default Form;
