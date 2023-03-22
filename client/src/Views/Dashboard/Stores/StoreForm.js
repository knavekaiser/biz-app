import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Checkbox,
  FileInputNew,
  Input,
  Radio,
  Select,
} from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt } from "Components/modal";
import * as yup from "yup";
import s from "./store.module.scss";
import { endpoints } from "config";

const addSchema = yup.object({
  name: yup.string().required(),
  business: yup
    .mixed()
    .when("createNew", (createNew, field) => {
      if (createNew === "yes") {
        return yup
          .object({
            name: yup.string().required("Name is a required field"),
            phone: yup.string().required("Phone is a required field"),
            password: yup.string().required("Password is a required field"),
          })
          .required()
          .typeError("Please enter business detail");
      } else {
        return yup
          .object({
            _id: yup.string().required("Please select a business"),
          })
          .required("Please select a business")
          .typeError("Plase select a business");
      }
    })
    .required(),
  createNew: yup.string().required(),
});
const updateSchema = yup.object({
  name: yup.string().required(),
});

const Form = ({ edit, onSuccess }) => {
  const {
    handleSubmit,
    register,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: useYup(edit ? updateSchema : addSchema),
  });

  const {
    post: addStore,
    put: updateStore,
    loading,
  } = useFetch(endpoints.stores + `/${edit?._id || ""}`);

  const createNew = watch("createNew");

  useEffect(() => {
    reset({
      name: edit?.name || "",
      featured: edit?.featured || false,
      business: edit?.business?._id || "",
      image: edit?.image ? [edit?.image] : [],
      createNew: edit ? "no" : "yes",
    });
  }, [edit]);
  return (
    <div className={`grid gap-1 p-1 ${s.addEmpForm}`}>
      <form
        onSubmit={handleSubmit((values) => {
          const payload = {
            name: values.name,
            featured: values.featured,
            image: values.image?.[0],
            business: !edit
              ? values.createNew === "yes"
                ? { ...values.business, _id: undefined }
                : values.business._id
              : values.business,
          };
          const formData = new FormData();
          Object.entries(payload).forEach(([key, value]) => {
            if (value?.type) {
              formData.append(key, value);
            } else if (typeof value === "object") {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          });
          (edit ? updateStore : addStore)(formData).then(({ data }) => {
            if (data.errors) {
              return Prompt({ type: "error", message: data.message });
            } else if (data.success) {
              onSuccess(data.data);
            }
          });
        })}
        className={`${s.mainForm} grid gap-1`}
      >
        <Checkbox label="Featured" {...register("featured")} />
        <Input
          label="Name"
          required
          {...register("name")}
          error={errors.name}
        />

        <FileInputNew label="Image" name="image" control={control} thumbnail />

        {!edit && (
          <>
            <h4>Business</h4>

            <Radio
              register={register}
              name="createNew"
              options={[
                { label: "Create New", value: "yes" },
                { label: "Connect Existing", value: "no" },
              ]}
            />

            {createNew === "yes" ? (
              <>
                <Input
                  label="Business Name"
                  required
                  {...register("business.name")}
                  error={errors[`business.name`]}
                />
                <Input
                  label="Phone"
                  required
                  {...register("business.phone")}
                  error={errors[`business.phone`]}
                />
                <Input
                  label="Password"
                  required
                  {...register("business.password")}
                  error={errors[`business.password`]}
                />
              </>
            ) : (
              <Select
                disabled={edit?._id}
                control={control}
                label="Business"
                url={endpoints.findBusinesses}
                getQuery={(inputValue, selected) => ({
                  ...(inputValue && { name: inputValue }),
                  ...(selected && { _id: selected }),
                })}
                handleData={(item) => ({
                  label: item.name,
                  value: item._id,
                })}
                name="business._id"
                formOptions={{ required: true }}
              />
            )}
          </>
        )}

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
