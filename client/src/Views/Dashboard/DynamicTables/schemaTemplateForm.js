import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Select } from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt, Modal } from "Components/modal";
import {
  FaPencilAlt,
  FaRegTrashAlt,
  FaTimes,
  FaCheck,
  FaPlus,
} from "react-icons/fa";
import * as yup from "yup";
import s from "./payments.module.scss";
import { endpoints } from "config";

const mainSchema = yup.object({
  schema_id: yup.string().required(),
});

const Form = ({ onSuccess }) => {
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: useYup(mainSchema),
  });
  const [schemas, setSchemas] = useState([]);
  const { get: getSchemas, loading } = useFetch(endpoints.schemaTemplates);
  const { post: saveSchema, loading: savingSchema } = useFetch(
    endpoints.schemaTemplates
  );

  useEffect(() => {
    getSchemas()
      .then(({ data }) => {
        if (data?.success) {
          setSchemas(data.data);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);
  return (
    <div className={`grid gap-1 p-1`}>
      <form
        onSubmit={handleSubmit((values) => {
          saveSchema(values)
            .then(({ data }) => {
              if (data?.success) {
                return Prompt({
                  type: "success",
                  message: data.message,
                  callback: () => {
                    onSuccess(data.data);
                  },
                });
              }
              if (data.errors) {
                return Prompt({ type: "error", message: data.message });
              }
            })
            .catch((err) => Prompt({ type: "error", message: err.message }));
        })}
        className={`${s.mainForm} grid gap-1`}
      >
        <Select
          control={control}
          name="schema_id"
          label="Select Schema"
          options={schemas.map((item) => ({
            label: item.name,
            value: item._id,
          }))}
          formOptions={{ required: true }}
        />
        <div className="btns mt-1">
          <button className="btn" disabled={loading || savingSchema}>
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;
