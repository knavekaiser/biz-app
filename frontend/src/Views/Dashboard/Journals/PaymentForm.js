import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Input, Select, Combobox } from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt } from "Components/modal";
import * as yup from "yup";
import s from "./payments.module.scss";
import { endpoints } from "config";
import { RiCloseLargeFill } from "react-icons/ri";

const Form = ({ edit, onSuccess }) => {
  const [entries, setEntries] = useState([]);
  const {
    handleSubmit,
    register,
    reset,
    control,
    setFocus,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const {
    post: saveEntries,
    put: updateEntry,
    loading,
  } = useFetch(endpoints.journals + `/${edit?._id || ""}`);

  const submitForm = useCallback(
    (values) => {
      if (
        entries.some((entry, i) => {
          if (
            entry.accountId &&
            ((entry.type === "credit" && entry.credit) ||
              (entry.type === "debit" && entry.debit))
          ) {
            return false;
          }
          if (!entry.type) {
            setError(`entries_${i}_type`, {
              type: "custom",
              message: "Please select a type.",
            });
          } else {
            if (entry.type === "debit" && !entry.debit) {
              setError(`entries_${i}_debit`, {
                type: "custom",
                message: "Please enter debit.",
              });
            } else if (entry.type === "credit" && !entry.credit) {
              setError(`entries_${i}_credit`, {
                type: "custom",
                message: "Please enter credit.",
              });
            }
          }
          if (!entry.accountId) {
            setError(`entries_${i}_accountId`, {
              type: "custom",
              message: "Please select an account.",
            });
          }
          return true;
        })
      ) {
        return;
      }

      (edit
        ? updateEntry({
            accountId: values.entries_0_accountId,
            credit: +values.entries_0_credit || 0,
            debit: +values.entries_0_debit || 0,
          })
        : saveEntries({
            entries: entries.map((entry) => ({
              accountId: entry.accountId,
              debit: +entry.debit || 0,
              credit: +entry.credit || 0,
            })),
          })
      )
        .then(({ data }) => {
          if (!data.success) {
            return Prompt({ type: "error", message: data.message });
          }
          onSuccess(data.data);
        })
        .catch((err) => Prompt({ type: "error", message: err.message }));
    },
    [entries]
  );

  useEffect(() => {
    reset({
      entries_0_type: edit?.debit > edit?.credit ? "debit" : "credit",
      entries_0_accountId: edit?.accountId || "",
      entries_0_debit: edit?.debit || "",
      entries_0_credit: edit?.credit || "",
    });
    setEntries([
      {
        _id: edit?._id || Math.random().toString(36),
        type: edit?.debit > edit?.credit ? "debit" : "credit",
        accountId: edit?.accountId || "",
        debit: edit?.debit || "",
        credit: edit?.credit || "",
      },
    ]);
  }, [edit]);

  return (
    <div className={`grid gap-1 p-1 ${s.addPaymentForm}`}>
      <h3>Entries</h3>

      <div className={`${s.mainForm} grid gap-1`}>
        <form
          className={`${s.mainFormWrapper} grid gap-1 all-columns`}
          onSubmit={handleSubmit(submitForm)}
        >
          {/* <Input
          label="Date"
          type="date"
          {...register("date")}
          required
          error={errors.date}
        /> */}

          {(entries || []).map((entry, i) => (
            <div key={entry._id} className={s.entryForm}>
              <Combobox
                label="Type"
                control={control}
                name={`entries_${i}_type`}
                formOptions={{ required: true }}
                options={[
                  { label: "Credit", value: "credit" },
                  { label: "Debit", value: "debit" },
                ]}
                onChange={(opt) => {
                  if (opt.value === "credit") {
                    clearErrors(`entries_${i}_debit`);
                  } else {
                    clearErrors(`entries_${i}_credit`);
                  }
                  setEntries((prev) =>
                    prev.map((item) =>
                      item._id === entry._id
                        ? { ...item, type: opt.value }
                        : item
                    )
                  );
                }}
              />
              <Select
                label="Account"
                control={control}
                name={`entries_${i}_accountId`}
                formOptions={{ required: true }}
                url={endpoints.accountingMasters}
                getQuery={(v) => ({
                  isGroup: "false",
                  name: v || "",
                })}
                handleData={(data) => ({
                  label: `${data.name}${data.type ? ` - ${data.type}` : ""}`,
                  value: data._id,
                  account: data,
                })}
                onChange={(opt) => {
                  setEntries((prev) =>
                    prev.map((item) =>
                      item._id === entry._id
                        ? { ...item, accountId: opt.value }
                        : item
                    )
                  );
                  setFocus(`entries_${i}_${entry.type}`);
                }}
              />
              <Input
                label="Debit"
                type="number"
                step="0.01"
                required
                disabled={entry.type === "credit"}
                {...register(`entries_${i}_debit`)}
                onChange={(e) => {
                  clearErrors(`entries_${i}_debit`);
                  setEntries((prev) =>
                    prev.map((item) =>
                      item._id === entry._id
                        ? { ...item, debit: e.target.value }
                        : item
                    )
                  );
                }}
                error={errors[`entries_${i}_debit`]}
              />
              <Input
                label="Credit"
                type="number"
                step="0.01"
                required
                disabled={entry.type === "debit"}
                {...register(`entries_${i}_credit`)}
                onChange={(e) => {
                  clearErrors(`entries_${i}_credit`);
                  setEntries((prev) =>
                    prev.map((item) =>
                      item._id === entry._id
                        ? { ...item, credit: e.target.value }
                        : item
                    )
                  );
                }}
                error={errors[`entries_${i}_credit`]}
              />
              {entries.length > 1 && (
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

          {!loading && !edit && (
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
              Add More Entry
            </button>
          )}

          <div className="btns">
            <button className="btn" disabled={loading}>
              {edit ? "Update" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
