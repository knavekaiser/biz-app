import { useState, useEffect, useContext, useRef } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import {
  Input,
  Textarea,
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

const itemSchema = yup.object({
  name: yup.string().required(),
  dataType: yup.string().required(),
  label: yup.string().required(),
  fieldType: yup.string().required(),
  inputType: yup.string(),
  required: yup.boolean(),
});

const Detail = ({ label, value, className }) => {
  return (
    <p className={`${s.detail} ${className || ""}`}>
      <span className={s.label}>{label}:</span>{" "}
      <span className={s.value}>{value}</span>
    </p>
  );
};

const Form = ({ edit, collections, onSuccess }) => {
  const { user, config } = useContext(SiteContext);
  const [fields, setFields] = useState(edit?.fields || []);
  const [editField, setEditField] = useState(null);
  const [err, setErr] = useState(null);
  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });
  return (
    <div className={`grid gap-1 p-1 ${s.addCollectionForm}`}>
      <h3>Fields</h3>
      {fields.length > 0 ? (
        <Table
          className={s.fields}
          columns={[
            { label: "Name" },
            { label: "Data Type" },
            { label: "Label" },
            { label: "Field Type" },
            { label: "Input Type" },
            { label: "Required" },
            { label: "Action", action: true },
          ]}
        >
          {fields.map((item, i) => (
            <tr key={i}>
              <td>
                <span className="ellipsis">{item.name}</span>
              </td>
              <td>{item.dataType}</td>
              <td>{item.label}</td>
              <td>{item.fieldType}</td>
              <td>{item.inputType}</td>
              <td>{item.required ? "Yes" : "No"}</td>
              <TableActions
                actions={[
                  {
                    icon: <FaPencilAlt />,
                    label: "Edit",
                    callBack: () => setEditField(item),
                  },
                  {
                    icon: <FaRegTrashAlt />,
                    label: "Delete",
                    callBack: () =>
                      Prompt({
                        type: "confirmation",
                        message: `Are you sure you want to remove this Field?`,
                        callback: () => {
                          setFields((prev) =>
                            prev.filter((product) => product._id !== item._id)
                          );
                        },
                      }),
                  },
                ]}
              />
            </tr>
          ))}
        </Table>
      ) : (
        <p className={s.noContent}>No fields yet.</p>
      )}
      {err && <p className="error">{err}</p>}

      <FieldForm
        key={editField ? "edit" : "add"}
        edit={editField}
        editCollection={edit}
        collections={collections}
        onSuccess={(newField) => {
          setErr(null);
          if (editField) {
            setFields((prev) => {
              return prev.map((item) =>
                item.name.toLowerCase() === newField.name.toLowerCase()
                  ? newField
                  : item
              );
            });
            setEditField(null);
          } else {
            setFields((prev) => [...prev, newField]);
          }
        }}
      />

      <h3 className="mt-1">Table Information</h3>

      <MainForm
        disabled={editField}
        edit={edit}
        fields={fields}
        setErr={setErr}
        onSuccess={onSuccess}
      />
    </div>
  );
};

const FieldForm = ({ edit, editCollection, collections, onSuccess }) => {
  const { config } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    clearErrors,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      unit: "Piece",
    },
    resolver: useYup(itemSchema),
  });
  const inputType = watch("inputType");
  const dataType = watch("dataType");
  const collection = watch("collection");
  const fieldType = watch("fieldType");
  const optionType = watch("optionType");
  useEffect(() => {
    reset({ ...edit });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (!edit) {
          values._id = Math.random().toString().substr(-8);
        }
        console.log(values);
        onSuccess(values);
        reset();
      })}
      className={`${s.fieldForm} grid gap-1`}
    >
      <h3 className="all-columns">Data</h3>

      <Input
        label="Field Name"
        type="text"
        required
        {...register("name")}
        error={errors.name}
      />
      <Combobox
        label="Data Type"
        name="dataType"
        watch={watch}
        register={register}
        setValue={setValue}
        required
        clearErrors={clearErrors}
        options={[
          { label: "String", value: "string" },
          { label: "Number", value: "number" },
          { label: "Date", value: "date" },
          { label: "Boolean", value: "boolean" },
          { label: "Array", value: "array" },
          { label: "Object ID", value: "objectId" },
        ]}
        error={errors.inputType}
      />

      {dataType === "objectId" && (
        <>
          <Select
            control={control}
            label="Collection"
            options={collections
              .filter((coll) => coll._id !== editCollection?._id)
              .map((item) => ({
                label: item.name,
                value: item.name,
              }))}
            register={register}
            name="collection"
            formOptions={{ required: true }}
            watch={watch}
            setValue={setValue}
            error={errors.collection}
            className={s.itemName}
          />

          {collection && (
            <Combobox
              label="Foreign Field"
              name="foreignField"
              watch={watch}
              register={register}
              setValue={setValue}
              required
              clearErrors={clearErrors}
              options={[
                {
                  label: "ID",
                  value: "_id",
                },
                ...(collections
                  .find((coll) => coll.name === collection)
                  ?.fields.map((item) => ({
                    label: item.label,
                    value: item.name,
                  })) || []),
              ]}
              error={errors.foreignField}
            />
          )}
        </>
      )}

      <h3 className="all-columns">Input</h3>
      <Input
        label="Label"
        type="text"
        required
        {...register("label")}
        error={errors.label}
      />

      <Combobox
        label="Field Type"
        name="fieldType"
        watch={watch}
        register={register}
        setValue={setValue}
        required
        clearErrors={clearErrors}
        options={[
          { label: "Input", value: "input" },
          { label: "Textarea", value: "textarea" },
          { label: "Combobox", value: "combobox" },
          { label: "Select", value: "select" },
        ]}
        error={errors.fieldType}
      />

      {fieldType !== "combobox" && (
        <Combobox
          label="Input Type"
          name="inputType"
          watch={watch}
          register={register}
          setValue={setValue}
          required
          clearErrors={clearErrors}
          options={[
            { label: "Text", value: "text" },
            { label: "Number", value: "number" },
            { label: "Date", value: "date" },
            { label: "File", value: "file" },
          ]}
          error={errors.inputType}
        />
      )}

      {["combobox", "select"].includes(fieldType) && (
        <Combobox
          label="Options type"
          name="optionType"
          watch={watch}
          register={register}
          setValue={setValue}
          required
          clearErrors={clearErrors}
          options={[
            { label: "Predefined", value: "array" },
            { label: "Other Collection", value: "collection" },
          ]}
          error={errors.optionType}
        />
      )}

      {optionType === "collection" && (
        <>
          <Select
            control={control}
            label="Collection"
            options={collections
              .filter((coll) => coll._id !== editCollection?._id)
              .map((item) => ({
                label: item.name,
                value: item.name,
              }))}
            register={register}
            name="collection"
            formOptions={{ required: true }}
            watch={watch}
            setValue={setValue}
            error={errors.collection}
            className={s.itemName}
          />

          {collection && (
            <>
              <Combobox
                label="Option Label"
                name="optionLabel"
                watch={watch}
                register={register}
                setValue={setValue}
                required
                clearErrors={clearErrors}
                options={[
                  {
                    label: "ID",
                    value: "_id",
                  },
                  ...(collections
                    .find((coll) => coll.name === collection)
                    ?.fields.map((item) => ({
                      label: item.label,
                      value: item.name,
                    })) || []),
                ]}
                error={errors.optionLabel}
              />

              <Combobox
                label="Option Value"
                name="optionValue"
                watch={watch}
                register={register}
                setValue={setValue}
                required
                clearErrors={clearErrors}
                options={[
                  {
                    label: "ID",
                    value: "_id",
                  },
                  ...(collections
                    .find((coll) => coll.name === collection)
                    ?.fields.map((item) => ({
                      label: item.label,
                      value: item.name,
                    })) || []),
                ]}
                error={errors.optionValue}
              />
            </>
          )}
        </>
      )}

      {inputType === "file" && (
        <Checkbox {...register("multiple")} label="Multiple" />
      )}

      <Checkbox {...register("required")} label="Required" />
      <button className="btn">Add Field</button>
    </form>
  );
};

const MainForm = ({ disabled, edit, fields, setErr, onSuccess }) => {
  const { config, setConfig } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: useYup(mainSchema),
  });

  const { post: saveCollection, put: updateCollection, loading } = useFetch(
    endpoints.collections + `/${edit?._id || ""}`
  );

  useEffect(() => {
    reset({
      ...edit,
    });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (fields.length < 1) {
          return setErr("Add at least one field");
        }

        (edit ? updateCollection : saveCollection)({
          name: values.name,
          fields: fields.map((item) => ({ ...item, _id: undefined })),
        }).then(({ data }) => {
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
        label="Table Name (singular)"
        type="text"
        {...register("name")}
        required
        error={errors.name}
      />

      <div className="btns">
        <button className="btn" disabled={disabled || loading}>
          {edit ? "Update" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default Form;
