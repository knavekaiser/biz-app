import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input, Combobox } from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt } from "Components/modal";
import * as yup from "yup";
import s from "./quotes.module.scss";
import { endpoints } from "config";

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
  openingBalance: yup
    .number()
    .required("Please enter opening balance")
    .typeError("Please enter a valid number"),
});

const Form = ({ edit, masters = [], onSuccess }) => {
  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: useYup(mainSchema),
  });

  const {
    post: createMaster,
    put: updateMaster,
    loading,
  } = useFetch(endpoints.accountingMasters + `/${edit?._id || ""}`);

  useEffect(() => {
    reset({
      name: edit?.name || "",
      parent: edit?.parent || "null",
      type: edit?.type || "null",
      isGroup: edit?.isGroup ?? true,
      openingBalance: edit?.openingBalance || 0,
    });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (values.parent === "null") {
          values.parent = null;
        }
        if (values.type === "null") {
          values.type = null;
        }
        (edit?._id ? updateMaster : createMaster)(values)
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

      <Input
        label="Opening Balance"
        type="number"
        {...register("openingBalance")}
        required
        error={errors.openingBalance}
      />

      <div className="btns">
        <button className="btn" disabled={loading}>
          {edit?._id ? "Update" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default Form;
