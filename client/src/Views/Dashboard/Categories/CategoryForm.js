import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt } from "Components/modal";
import * as yup from "yup";
import { endpoints } from "config";

const schema = yup.object({ name: yup.string().required() });

const Form = ({ edit, onSuccess }) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    resolver: useYup(schema),
  });

  const {
    post: save,
    put: update,
    loading,
  } = useFetch(endpoints.categories + `/${edit?._id || ""}`);

  useEffect(() => {
    reset({ ...edit });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        (edit ? update : save)({ ...values }).then(({ data }) => {
          if (data.errors) {
            return Prompt({ type: "error", message: data.message });
          } else if (data.success) {
            onSuccess(data.data);
          }
        });
      })}
      className={`grid gap-1 p-1`}
    >
      <Input label="Name" {...register("name")} required error={errors.name} />

      <div className="btns">
        <button className="btn" disabled={loading}>
          {edit ? "Update" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default Form;
