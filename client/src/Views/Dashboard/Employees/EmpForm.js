import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Select } from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt } from "Components/modal";
import * as yup from "yup";
import s from "./emps.module.scss";
import { endpoints } from "config";

const mainSchema = yup.object({
  employee: yup.string().required(),
  roles: yup.array().of(yup.string()),
});

const Form = ({ edit, onSuccess }) => {
  const { handleSubmit, reset, control } = useForm({
    resolver: useYup(mainSchema),
  });

  const { put: updateEmp, loading } = useFetch(
    endpoints.employees + `/${edit?._id || ""}`
  );

  useEffect(() => {
    reset({
      employee: edit?._id || "",
      roles: edit?.roles?.map((item) => item._id) || [],
    });
  }, [edit]);
  return (
    <div className={`grid gap-1 p-1 ${s.addEmpForm}`}>
      <form
        onSubmit={handleSubmit((values) => {
          updateEmp(values).then(({ data }) => {
            if (data.errors) {
              return Prompt({ type: "error", message: data.message });
            } else if (data.success) {
              onSuccess(data.data);
            }
          });
        })}
        className={`${s.mainForm} grid gap-1`}
      >
        <Select
          disabled={edit?._id}
          control={control}
          label="Staff"
          url={endpoints.staffs}
          getQuery={(inputValue, selected) => ({
            ...(inputValue && { name: inputValue }),
            ...(selected && { _id: selected }),
          })}
          handleData={(item) => ({
            label: item.name,
            value: item._id,
          })}
          name="employee"
          formOptions={{ required: true }}
        />

        <Select
          control={control}
          label="Role"
          url={endpoints.roles}
          getQuery={(inputValue, selected) => ({
            ...(inputValue && { name: inputValue }),
            ...(selected && { _id: selected }),
          })}
          handleData={(item) => ({
            label: item.name,
            value: item._id,
          })}
          multiple
          name="roles"
          formOptions={{ required: true }}
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
