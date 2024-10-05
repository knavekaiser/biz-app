import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input, moment } from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt } from "Components/modal";
import * as yup from "yup";
import s from "./style.module.scss";
import { endpoints } from "config";

const mainSchema = yup.object({
  label: yup.string().required("Label is required."),
  startDate: yup.string().required("Start Date is required."),
  endDate: yup.string().required("End Date is required."),
});

const Form = ({ edit, onSuccess }) => {
  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm({
    resolver: useYup(mainSchema),
  });

  const { post, put, loading } = useFetch(
    endpoints.finPeriods + `/${edit?._id || ""}`
  );

  useEffect(() => {
    reset({
      label: edit?.label || "",
      startDate: edit?.startDate ? moment(edit.startDate, "YYYY-MM-DD") : "",
      endDate: edit?.endDate ? moment(edit.endDate, "YYYY-MM-DD") : "",
    });
  }, [edit]);
  return (
    <div className={`grid gap-1 p-1 ${s.addForm}`}>
      <form
        onSubmit={handleSubmit((values) => {
          (edit ? put : post)(values)
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
          label="Label"
          {...register("label")}
          required
          error={errors.label}
        />
        <Input
          label="Start Date"
          type="date"
          {...register("startDate")}
          error={errors.startDate}
          required
        />
        <Input
          label="End Date"
          type="date"
          {...register("endDate")}
          required
          error={errors.endDate}
        />

        <div className="btns">
          <button className="btn" disabled={loading}>
            {edit ? "Update" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;
