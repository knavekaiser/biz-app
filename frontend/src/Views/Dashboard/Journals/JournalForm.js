import { useState, useEffect, useCallback, useContext } from "react";
import { useForm } from "react-hook-form";
import { Input, Select, Combobox, moment, Textarea } from "Components/elements";
import { useFetch, useYup } from "hooks";
import { Prompt } from "Components/modal";
import s from "./journals.module.scss";
import * as yup from "yup";
import { endpoints } from "config";
import { RiCloseLargeFill } from "react-icons/ri";
import { SiteContext } from "SiteContext";

const schema = yup.object({
  dateTime: yup.date().required(),
});

const Form = ({ edit, onSuccess }) => {
  const { finPeriod } = useContext(SiteContext);
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
  } = useForm({
    resolver: useYup(schema),
  });

  const {
    post: saveEntry,
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

      const totalDebit = entries.reduce((p, c) => p + +(c.debit || 0), 0);
      const totalCredit = entries.reduce((p, c) => p + +(c.credit || 0), 0);
      if (totalDebit !== totalCredit) {
        return Prompt({
          type: "error",
          message: "Total debit does not match total credit.",
        });
      }

      (edit ? updateEntry : saveEntry)({
        dateTime: values.dateTime,
        detail: values.detail || null,
        accountingEntries: entries.map((entry) => ({
          accountId: entry.accountId,
          debit: +entry.debit || 0,
          credit: +entry.credit || 0,
        })),
      })
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
    let date = edit?.dateTime ? new Date(edit?.dateTime) : new Date();
    if (finPeriod && date < new Date(finPeriod.startDate)) {
      date = finPeriod.startDate;
    } else if (finPeriod && date > new Date(finPeriod.endDate)) {
      date = finPeriod.endDate;
    }
    const values = {
      dateTime: moment(date, "YYYY-MM-DD"),
      detail: edit?.detail || "",
    };
    if (edit?.entries?.length) {
      edit?.entries?.forEach((entry, i) => {
        values[`entries_${i}_type`] =
          entry.credit > entry.debit ? "credit" : "debit";
        values[`entries_${i}_accountId`] = entry.accountId;
        values[`entries_${i}_debit`] = entry.debit;
        values[`entries_${i}_credit`] = entry.credit;
      });
    } else {
      values.entries_0_type = "credit";
      values.entries_0_accountId = "";
      values.entries_0_debit = "";
      values.entries_0_credit = "";
    }
    reset(values);
    setEntries(
      edit?.entries?.length
        ? edit?.entries.map((item) => ({
            ...item,
            type: item.credit > item.debit ? "credit" : "debit",
          }))
        : [
            {
              _id: Math.random().toString(36),
              type: "credit",
              accountId: "",
              debit: "",
              credit: "",
            },
          ]
    );
  }, [edit]);

  return (
    <div className={`grid gap-1 p-1 ${s.addForm}`}>
      <div className={`${s.mainForm} grid gap-1`}>
        <form
          className={`${s.mainFormWrapper} grid gap-1 all-columns`}
          onSubmit={handleSubmit(submitForm)}
        >
          <Input
            label="Date"
            type="date"
            {...(finPeriod && {
              min: moment(finPeriod.startDate, "YYYY-MM-DD"),
              max: moment(finPeriod.endDate, "YYYY-MM-DD"),
            })}
            {...register("dateTime")}
            required
            error={errors.dateTime}
          />

          <h3>Entries</h3>

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
                    setValue(`entries_${i}_debit`, 0);
                    if (+entry.debit) {
                      setValue(`entries_${i}_credit`, +entry.debit || 0);
                    }
                  } else {
                    clearErrors(`entries_${i}_credit`);
                    setValue(`entries_${i}_credit`, 0);
                    if (+entry.credit) {
                      setValue(`entries_${i}_debit`, +entry.credit || 0);
                    }
                  }
                  setEntries((prev) =>
                    prev.map((item) =>
                      item._id === entry._id
                        ? {
                            ...item,
                            type: opt.value,
                            ...(opt.value === "debit" &&
                              +entry.credit && {
                                debit: +entry.credit,
                                credit: 0,
                              }),
                            ...(opt.value === "credit" &&
                              +entry.debit && {
                                credit: +entry.debit,
                                debit: 0,
                              }),
                          }
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
              Add More Entry
            </button>
          )}

          <hr />

          <div className={s.entryForm}>
            <span />
            <span className="text-right">Total</span>
            <span className="text-right">
              {entries.reduce((p, c) => p + +(c.debit || 0), 0)}
            </span>
            <span className="text-right">
              {entries.reduce((p, c) => p + +(c.credit || 0), 0)}
            </span>
          </div>

          <Textarea
            label="Detail"
            {...register(`detail`)}
            error={errors.detail}
          />

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
