import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input, Select } from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt } from "Components/modal";
import * as yup from "yup";
import s from "./sales.module.scss";
import { endpoints } from "config";

const Form = ({ edit, onSuccess }) => {
  const [next, setNext] = useState(false);
  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    resolver: useYup(
      yup.object({
        name: yup.string().required(),
        phone: yup.string().required(),
        password: edit ? yup.string() : yup.string().required(),
        subPlan: yup.string().required(),
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
      subPlan: edit?.subscription?.plan?._id || "",
    });
  }, [edit]);
  return (
    <div className={`grid gap-1 p-1 ${s.addRoleForm}`}>
      <form
        autoComplete="new-password"
        onSubmit={handleSubmit((values) => {
          if (!values.password) {
            delete values.password;
          }
          (edit ? updateBusiness : saveBusiness)(values)
            .then(({ data }) => {
              if (!data.success) {
                return Prompt({ type: "error", message: data.message });
              }
              onSuccess(data.data, next);
            })
            .catch((err) => Prompt({ type: "error", message: err.message }));
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
          required={!edit}
          error={errors.password}
        />

        <Select
          control={control}
          label="Subscription Plan*"
          name="subPlan"
          url={endpoints.subPlans}
          getQuery={(inputValue, selected) => ({
            name: inputValue,
            _id: selected,
          })}
          handleData={(item) => ({
            label: item.name,
            value: item._id,
          })}
        />

        <div className="btns">
          <button className="btn" disabled={loading}>
            {edit ? "Update" : "Submit"}
          </button>
          {!edit && (
            <button
              className="btn"
              disabled={loading}
              onClick={() => {
                setNext(true);
              }}
            >
              Next
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Form;
