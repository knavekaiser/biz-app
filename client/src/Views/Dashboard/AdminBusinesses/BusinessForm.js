import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input, Table, Checkbox } from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt } from "Components/modal";
import * as yup from "yup";
import s from "./sales.module.scss";
import { endpoints, tables } from "config";
import { SiteContext } from "SiteContext";

const Form = ({ edit, onSuccess }) => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: useYup(
      yup.object({
        name: yup.string().required(),
        phone: yup.string().required(),
        password: edit ? yup.string() : yup.string().required(),
      })
    ),
  });

  const {
    post: saveBusiness,
    put: updateBusiness,
    loading,
  } = useFetch(endpoints.businesses + `/${edit?._id || ""}`);

  useEffect(() => {
    reset({
      name: edit?.name || "",
      phone: edit?.phone || "",
      password: "",
    });
  }, [edit]);
  return (
    <div className={`grid gap-1 p-1 ${s.addRoleForm}`}>
      <form
        autoComplete="new-password"
        onSubmit={handleSubmit((values) => {
          (edit ? updateBusiness : saveBusiness)(values).then(({ data }) => {
            if (data.errors) {
              return Prompt({ type: "error", message: data.message });
            } else if (data.success) {
              onSuccess(data.data);
            }
          });
        })}
        className={`${s.mainForm} grid gap-1`}
      >
        <Input
          label="Name"
          {...register("name")}
          required
          error={errors.name}
        />

        <Input
          label="Phone"
          {...register("phone")}
          required
          error={errors.phone}
        />

        <Input
          label="Password"
          type="password"
          {...register("password")}
          required
          error={errors.password}
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
