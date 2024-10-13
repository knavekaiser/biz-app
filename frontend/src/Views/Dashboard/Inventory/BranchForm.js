import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt } from "Components/modal";
import * as yup from "yup";
import s from "./quotes.module.scss";
import { endpoints } from "config";

const mainSchema = yup.object({
  name: yup.string().required("Please enter a name"),
});

const Form = ({ edit, onSuccess }) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    resolver: useYup(mainSchema),
  });

  const {
    post: createMaster,
    put: updateMaster,
    loading,
  } = useFetch(endpoints.inventoryBranches + `/${edit?._id || ""}`);

  useEffect(() => {
    reset({
      name: edit?.name || "",
    });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        (edit?._id ? updateMaster : createMaster)({
          name: values.name,
        })
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

      <div className="btns">
        <button className="btn" disabled={loading}>
          {edit?._id ? "Update" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default Form;
