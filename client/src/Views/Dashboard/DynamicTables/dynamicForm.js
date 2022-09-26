import { useState, useEffect, useContext, useRef } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import {
  Input,
  Textarea,
  FileInput,
  Combobox,
  Table,
  TableActions,
  Checkbox,
  Select,
  moment,
} from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt } from "Components/modal";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import * as yup from "yup";
import s from "./payments.module.scss";
import { useReactToPrint } from "react-to-print";
import { endpoints } from "config";

const mainSchema = yup.object({
  name: yup.string().required(),
});

const MainForm = ({ collection, edit, onSuccess }) => {
  const { config, setConfig } = useContext(SiteContext);

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
    clearErrors,
  } = useForm({
    resolver: useYup(
      yup.object({
        ...collection.fields
          .map((f) => {
            let field;
            if (["objectId", "string"].includes(f.dataType)) {
              field = yup.string();
            }
            if (f.dataType === "number") {
              field = yup.number();
            }
            if (f.dataType === "array") {
              field = yup.mixed();
            }
            if (f.required) {
              field = field.required(
                field.errorMessage || `${f.label} is required`
              );
            }
            return field;
          })
          .reduce((p, c, i) => {
            p[collection.fields[i]?.name] = c;
            return p;
          }, {}),
      })
    ),
  });
  const { post: saveData, put: updateData, loading } = useFetch(
    `${endpoints.dynamic}/${collection.name}/${edit?._id || ""}`
  );

  useEffect(() => {
    reset({
      ...edit,
    });
  }, [edit]);

  const images = watch("images");

  const fields = collection.fields.map((field, i) => {
    if (field.inputType === "file") {
      return (
        <FileInput
          key={i}
          label={field.label}
          multiple={field.multiple}
          prefill={images}
          thumbnail
          onChange={(files) => {
            setValue(field.name, files);
          }}
        />
      );
    }
    if (field.fieldType === "input") {
      return (
        <Input
          key={i}
          {...register(field.name)}
          label={field.label}
          required={field.required}
          error={errors[field.name]}
        />
      );
    }
    if (field.fieldType === "textarea") {
      return (
        <Textarea
          key={i}
          {...register(field.name)}
          label={field.label}
          required={field.required}
          error={errors[field.name]}
        />
      );
    }
    if (field.fieldType === "combobox") {
      return (
        <Combobox
          key={i}
          label={field.label}
          required={field.required}
          name={field.name}
          watch={watch}
          register={register}
          setValue={setValue}
          clearErrors={clearErrors}
          options={[]}
          error={errors[field.name]}
        />
      );
    }
    if (field.fieldType === "select") {
      return (
        <Select
          key={i}
          control={control}
          label={field.label}
          {...(field.optionType === "predefined" && { options: field.options })}
          {...(field.optionType === "collection" && {
            url: `${endpoints.dynamic}/${field.collection}`,
          })}
          getQuery={(inputValue) => ({ [field.optionValue]: inputValue })}
          handleData={(data, setOptions) =>
            setOptions(
              data.map((item) => ({
                label: item[field.optionLabel],
                value: item[field.optionValue],
              }))
            )
          }
          register={register}
          name={field.name}
          formOptions={{ required: field.required }}
          watch={watch}
          setValue={setValue}
          error={errors[field.name]}
          className={s.itemName}
        />
      );
    }
  });

  return (
    <div className={`grid gap-1 p-1`}>
      <form
        onSubmit={handleSubmit((values) => {
          let payload = { ...values };
          if (collection.fields.some((field) => field.inputType === "file")) {
            payload = new FormData();
            collection.fields.forEach((field) => {
              const value = values[field.name];
              if (field.inputType === "file" && value.length) {
                for (const file of value) {
                  payload.append(`${field.name}`, file.uploadFilePath || file);
                }
                return;
              }
              return payload.append(field.name, value);
            });
          }
          (edit ? updateData : saveData)(payload).then(({ data }) => {
            if (data.errors) {
              return Prompt({ type: "error", message: data.message });
            } else if (data.success) {
              onSuccess(data.data);
            }
          });
        })}
        className={`${s.mainForm} grid gap-1`}
      >
        {fields}

        <div className="btns">
          <button className="btn" disabled={loading}>
            {edit ? "Update" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MainForm;
