import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input, Select, Combobox } from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt } from "Components/modal";
import * as yup from "yup";
import s from "./quotes.module.scss";
import { endpoints } from "config";
import { RiCloseLargeFill } from "react-icons/ri";

const mainSchema = yup.object({
  name: yup.string().required("Please enter a name"),
  isGroup: yup.boolean().required(),
  parent: yup.string().when("isGroup", {
    is: false,
    then: (schema) => schema.required("Please select a group."),
    otherwise: (schema) => schema,
  }),
  // type: yup
  //   .string()
  //   .oneOf([
  //     "Cash",
  //     "Bank",
  //     "Customers",
  //     "Suppliers",
  //     "Sales",
  //     "Purchase",
  //     "Stock",
  //     "null",
  //     "Tax",
  //     null,
  //   ])
  //   .nullable(),
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
    watch,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: useYup(mainSchema),
  });

  const isGroup = watch("isGroup");

  const {
    post: createMaster,
    put: updateMaster,
    loading,
  } = useFetch(endpoints.inventoryMasters + `/${edit?._id || ""}`);

  useEffect(() => {
    const values = {
      name: edit?.name || "",
      parent: edit?.parent || "",
      // type: edit?.type || "null",
      isGroup: edit?.isGroup ?? true,
    };
    if (edit?.openingStocks?.length) {
      edit?.openingStocks?.forEach((entry, i) => {
        values[`entries_${i}_branch`] = entry.branch;
        values[`entries_${i}_openingStock`] = entry.openingStock;
        values[`entries_${i}_cost`] = entry.cost;
        values[`entries_${i}_reorderQty`] = entry.reorderQty;
      });
    } else {
      values.entries_0_branch = "";
      values.entries_0_openingStock = "";
      values.entries_0_cost = "";
      values.entries_0_reorderQty = "";
    }
    reset(values);
    setEntries(
      edit?.openingStocks?.length
        ? edit?.openingStocks
        : [
            {
              _id: Math.random().toString(36),
              branch: "",
              openingStock: "",
              reorderQty: "",
            },
          ]
    );
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (
          !values.isGroup &&
          entries.some((entry, i) => {
            if (
              entry.branch &&
              entry.openingStock &&
              entry.cost &&
              entry.reorderQty
            ) {
              return false;
            }
            if (!entry.branch) {
              setError(`entries_${i}_branch`, {
                type: "custom",
                message: "Name is required.",
              });
            }
            if (!entry.openingStock) {
              setError(`entries_${i}_openingStock`, {
                type: "custom",
                message: "Stock is required.",
              });
            }
            if (!entry.cost) {
              setError(`entries_${i}_cost`, {
                type: "custom",
                message: "Cost is required.",
              });
            }
            if (!entry.reorderQty) {
              setError(`entries_${i}_reorderQty`, {
                type: "custom",
                message: "Reorder QTY is required.",
              });
            }
            return true;
          })
        ) {
          return;
        }

        if (!values.parent) {
          values.parent = null;
        }

        const payload = {
          name: values.name,
          isGroup: values.isGroup,
          parent: values.parent,
          type: values.type,
        };
        if (!values.isGroup) {
          payload.openingStocks = entries.map((entry) => ({
            branch: entry.branch,
            openingStock: entry.openingStock,
            cost: entry.cost,
            reorderQty: entry.reorderQty,
          }));
        }
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
        formOptions={{ required: !isGroup }}
        placeholder=""
        options={[
          { label: "None", value: "" },
          ...masters.map((item) => ({ label: item.name, value: item._id })),
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

      {!isGroup && (
        <>
          <h3>Opening Stocks</h3>

          {(entries || []).map((entry, i) => (
            <div key={entry._id} className={s.entryForm}>
              <Select
                label="Branch"
                control={control}
                name={`entries_${i}_branch`}
                formOptions={{ required: true }}
                url={endpoints.inventoryBranches}
                getQuery={(v) => ({ name: v })}
                handleData={(data) => ({
                  label: data.name,
                  value: data._id,
                })}
                onChange={(opt) => {
                  clearErrors(`entries_${i}_openingStock`);
                  setEntries((prev) =>
                    prev.map((item) =>
                      item._id === entry._id
                        ? { ...item, branch: opt.value }
                        : item
                    )
                  );
                }}
              />
              <Input
                label="Opening Stock"
                type="number"
                required
                {...register(`entries_${i}_openingStock`)}
                onChange={(e) => {
                  clearErrors(`entries_${i}_openingStock`);
                  setEntries((prev) =>
                    prev.map((item) =>
                      item._id === entry._id
                        ? { ...item, openingStock: e.target.value }
                        : item
                    )
                  );
                }}
                error={errors[`entries_${i}_openingStock`]}
              />
              <Input
                label="Cost"
                type="number"
                required
                {...register(`entries_${i}_cost`)}
                onChange={(e) => {
                  clearErrors(`entries_${i}_cost`);
                  setEntries((prev) =>
                    prev.map((item) =>
                      item._id === entry._id
                        ? { ...item, cost: e.target.value }
                        : item
                    )
                  );
                }}
                error={errors[`entries_${i}_cost`]}
              />
              <Input
                label="Reorder QTY"
                type="number"
                required
                {...register(`entries_${i}_reorderQty`)}
                onChange={(e) => {
                  clearErrors(`entries_${i}_reorderQty`);
                  setEntries((prev) =>
                    prev.map((item) =>
                      item._id === entry._id
                        ? { ...item, reorderQty: e.target.value }
                        : item
                    )
                  );
                }}
                error={errors[`entries_${i}_reorderQty`]}
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
        </>
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
