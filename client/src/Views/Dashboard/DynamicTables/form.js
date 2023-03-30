import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Input,
  Combobox,
  Table,
  TableActions,
  Checkbox,
  Select,
  CustomRadio,
} from "Components/elements";
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

yup.addMethod(yup.string, "noneOf", function (arr, message) {
  return this.test("noneOf", message, function (value) {
    const { path, createError } = this;
    return (
      !arr.includes(value) ||
      createError({
        path,
        message: message?.replace(`{value}`, value) || message,
      })
    );
  });
});

const mainSchema = yup.object({
  name: yup.string().required(),
});

const optionsSchema = yup.object({
  label: yup.string().required(),
  value: yup.string().required(),
});

const Form = ({ edit, collections, onSuccess }) => {
  const [fields, setFields] = useState(edit?.fields || []);
  const [editField, setEditField] = useState(null);
  const [err, setErr] = useState(null);

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
    setError,
  } = useForm({
    resolver: useYup(mainSchema),
  });
  const {
    post: saveCollection,
    put: updateCollection,
    loading,
  } = useFetch(endpoints.collections + `/${edit?._id || ""}`);
  const tableName = watch("name");
  const onSubmit = useCallback(
    (values) => {
      if (!values.name && tableName) {
        values.name = tableName;
      }
      if (!values.name) {
        setError("name", {
          type: "required",
          message: "Table name is required",
        });
        return;
      }
      if (fields.length < 1) {
        return setErr("Add at least one field");
      }
      if (values.name === "Product") {
        if (!fields.find((item) => item.name === "images")) {
          return setErr('"images" is a required field');
        }
        if (!fields.find((item) => item.name === "title")) {
          return setErr('"title" is a required field');
        }
        if (!fields.find((item) => item.name === "price")) {
          return setErr('"price" is a required field');
        }
        if (!fields.find((item) => item.name === "whatsappNumber")) {
          return setErr('"whatsappNumber" is a required field');
        }
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
    },
    [fields, tableName]
  );

  useEffect(() => {
    if (
      fields.length > 0 &&
      JSON.stringify(fields) !== JSON.stringify(edit?.fields || [])
    ) {
      onSubmit({ name: edit?.name || "" });
    }
  }, [fields, edit]);
  useEffect(() => {
    reset({ ...edit });
  }, [edit]);
  return (
    <div className={`grid gap-1 p-1 ${s.addCollectionForm}`}>
      <h3>Table Information</h3>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`${s.mainForm} grid gap-1`}
      >
        <Input
          label="Table Name (singular)"
          type="text"
          {...register("name")}
          required
          readOnly={edit}
          error={errors.name}
        />
      </form>

      <h3>Fields</h3>
      <Table
        className={s.fields}
        columns={[
          { label: "Name" },
          ...(edit?.name === "Product" ? [{ label: "Category" }] : []),
          { label: "Data Type" },
          { label: "Label" },
          { label: "Field Type" },
          { label: "Input Type" },
          { label: "Required" },
          { label: "Action", action: true },
        ]}
        placeholder="No fields yet."
      >
        {fields.map((item, i) => (
          <tr key={i}>
            <td>
              <span className="ellipsis">{item.name}</span>
            </td>
            {edit?.name === "Product" && <td>{item.category}</td>}
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
                          prev.filter((product) => product.name !== item.name)
                        );
                      },
                    }),
                },
              ]}
            />
          </tr>
        ))}
      </Table>
      {err && <p className="error">{err}</p>}

      <FieldForm
        key={editField ? "edit" : "add"}
        edit={editField}
        editCollection={edit}
        fields={fields}
        collections={collections}
        productCollection={collections.find((c) => c?.name === "Product")}
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
        clear={() => setEditField(null)}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`${s.mainForm} grid gap-1`}
      >
        {
          //   <div className="btns mt-1">
          //   <button className="btn" disabled={editField || loading}>
          //     {edit ? "Update" : "Submit"}
          //   </button>
          // </div>
        }
      </form>
    </div>
  );
};

const defaultFields = [
  "title",
  "description",
  "images",
  "price",
  "whatsappNumber",
  "category",
];

const FieldForm = ({
  edit,
  fields,
  editCollection,
  collections,
  onSuccess,
  clear,
}) => {
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
    resolver: useYup(
      yup.object({
        name: yup
          .string()
          .noneOf(
            fields
              .filter((item) => (!edit ? true : edit.name !== item.name))
              .map((item) => item.name),
            `{value} already exists`
          )
          .required(),
        dataType: yup.string().required(),
        label: yup.string().required(),
        fieldType: yup.string(),
        inputType: yup.string(),
        required: yup.boolean(),
      })
    ),
  });
  const name = watch("name");
  const inputType = watch("inputType");
  const dataType = watch("dataType");
  const dataElementType = watch("dataElementType");
  const dataElements = watch("fields");
  const collection = watch("collection");
  const fieldType = watch("fieldType");
  const optionType = watch("optionType");
  const options = watch("options");
  const label = watch("label");

  const onSubmit = useCallback(
    (values) => {
      if (editCollection?.name === "Product") {
        const data = {};
        Object.entries(values).forEach(([key, value]) => {
          if (
            (key === "category" &&
              !defaultFields
                .filter((item) => item !== "category")
                .includes(key)) ||
            key !== "category"
          ) {
            data[key] = value;
          }
        });
        onSuccess(data);
      } else {
        onSuccess(values);
      }
      reset({
        category: "",
        name: "",
        inputType: "",
        dataType: "",
        dataElementType: "",
        dataElements: "",
        collection: "",
        fieldType: "",
        optionType: "",
        options: [],
        multiRange: "",
        label: "",
        required: "",
        decimalPlaces: "",
        unique: "",
      });
    },
    [edit]
  );
  useEffect(() => {
    reset({ ...edit });
  }, [edit]);

  return (
    <div className={s.fieldFormWrapper}>
      <div className={s.dataDetail}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`${s.fieldForm} grid gap-1`}
        >
          <div className="flex all-columns gap-1 justify-space-between align-center">
            <h3>Data</h3>

            {editCollection?.name === "Product" &&
              !defaultFields.includes(name) && (
                <Select
                  label="Category"
                  control={control}
                  url={endpoints.dynamic + "/Category"}
                  getQuery={(inputValue, selected) => ({
                    ...(inputValue && { name: inputValue }),
                    ...(selected && { name: selected }),
                  })}
                  handleData={(item) => ({
                    label: item.name,
                    value: item.name,
                  })}
                  name="category"
                />
              )}

            <Checkbox {...register("unique")} label="Unique" />
          </div>

          <Input
            label="Field Name"
            type="text"
            required
            disabled={edit}
            {...register("name")}
            error={errors.name}
          />
          <Combobox
            label="Data Type"
            name="dataType"
            control={control}
            formOptions={{ required: true }}
            options={[
              { label: "String", value: "string" },
              { label: "Number", value: "number" },
              { label: "Date", value: "date" },
              { label: "Boolean", value: "boolean" },
              { label: "Array", value: "array" },
              { label: "Variant Array", value: "variantArray" },
              { label: "Object", value: "object" },
              { label: "Object ID", value: "objectId" },
            ]}
            disabled={edit || fieldType === "richText"}
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
                name="collection"
                formOptions={{ required: true }}
                className={s.itemName}
              />

              {collection && (
                <Combobox
                  label="Foreign Field"
                  name="foreignField"
                  control={control}
                  formOptions={{ required: true }}
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
                />
              )}
            </>
          )}

          {["array", "variantArray"].includes(dataType) && (
            <Combobox
              label="Data Element Type"
              name="dataElementType"
              control={control}
              formOptions={{ required: true }}
              options={[
                { label: "String", value: "string" },
                { label: "Number", value: "number" },
                { label: "Date", value: "date" },
                { label: "Object", value: "object" },
              ]}
            />
          )}
        </form>

        {dataType === "object" &&
          !["includeProducts", "excludeProducts"].includes(name) && (
            <NestedObjectFields
              name={label || name}
              value={dataElements}
              setValue={(newValue) => setValue("objectFields", newValue)}
              collection={editCollection}
              collections={collections}
            />
          )}

        {
          // dataType === "object" &&
          // name === "includeProducts" &&
          // (productCollection ? (
          //   <ProductFilterFields
          //     name={`${
          //       name === "includeProducts"
          //         ? "Include Products"
          //         : "Exclude Products"
          //     } filters`}
          //     value={dataElements}
          //     setValue={(newValue) => setValue("includeProducts", newValue)}
          //     collection={editCollection}
          //     collections={collections}
          //     productCollection={productCollection}
          //   />
          // ) : (
          //   <p>
          //     Please add "Product" table to add "includeProducts" or
          //     "excludeProducts"
          //   </p>
          // ))
        }

        {["array", "variantArray"].includes(dataType) &&
          dataElementType === "object" && (
            <NestedObjectFields
              name={label || name}
              value={dataElements}
              setValue={(newValue) => setValue("fields", newValue)}
              collection={editCollection}
              collections={collections}
            />
          )}
      </div>

      <div className={s.inputDetail}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`${s.fieldForm} grid gap-1`}
        >
          <div className="flex all-columns justify-space-between align-center">
            <h3 className="all-columns">Input Field</h3>
            <Checkbox {...register("required")} label="Required" />
          </div>
          <Input
            label="Label"
            type="text"
            required
            {...register("label")}
            error={errors.label}
          />

          {!(
            ["array", "variantArray"].includes(dataType) &&
            dataElementType === "object"
          ) && (
            <Combobox
              label="Field Type"
              name="fieldType"
              control={control}
              formOptions={{ required: true }}
              options={[
                { label: "Input", value: "input" },
                { label: "Textarea", value: "textarea" },
                { label: "Rich Text", value: "richText" },
                { label: "Combobox", value: "combobox" },
                { label: "Autocomplete", value: "select" },
                { label: "Date Range", value: "dateRange" },
                { label: "Collection Filter", value: "collectionFilter" },
                { label: "None", value: "none" },
              ]}
              onChange={(opt) => {
                if (opt?.value === "richText") {
                  setValue("dataType", "object");
                }
              }}
            />
          )}

          {!(
            [
              "combobox",
              "textarea",
              "richText",
              "collectionFilter",
              "none",
            ].includes(fieldType) ||
            (["array", "variantArray"].includes(dataType) &&
              dataElementType === "object") ||
            (["includeProducts", "excludeProducts"].includes(name) &&
              dataType === "object")
          ) && (
            <Combobox
              label="Input Type"
              name="inputType"
              control={control}
              options={
                fieldType === "dateRange"
                  ? [{ label: "Calendar", value: "calendar" }]
                  : [
                      { label: "Text", value: "text" },
                      { label: "Number", value: "number" },
                      ...(fieldType !== "select"
                        ? [
                            { label: "Phone Number", value: "phone" },
                            { label: "Date", value: "date" },
                            { label: "File", value: "file" },
                            { label: "Calendar", value: "calendar" },
                            { label: "Password", value: "password" },
                          ]
                        : []),
                    ]
              }
            />
          )}

          {inputType === "number" && (
            <Combobox
              label="Decimal Places"
              name="decimalPlaces"
              control={control}
              options={[
                { label: "1", value: "0" },
                { label: "1.0", value: "0.0" },
                { label: "1.00", value: "0.00" },
                { label: "1.000", value: "0.000" },
                { label: "1.0000", value: "0.0000" },
                { label: "1.00000", value: "0.00000" },
              ]}
            />
          )}

          {["combobox", "select"].includes(fieldType) && (
            <Combobox
              label="Options type"
              name="optionType"
              control={control}
              formOptions={{ required: true }}
              options={[
                { label: "Predefined", value: "array" },
                {
                  label: "Other Collection",
                  value: "collection",
                  disabled: fieldType === "combobox",
                },
              ]}
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
                name="collection"
                formOptions={{ required: true }}
                className={s.itemName}
              />

              {collection && (
                <>
                  <Combobox
                    label="Option Label"
                    name="optionLabel"
                    control={control}
                    formOptions={{ required: true }}
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
                  />

                  <Combobox
                    label="Option Value"
                    name="optionValue"
                    control={control}
                    formOptions={{ required: true }}
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
                  />
                </>
              )}
            </>
          )}
        </form>

        {["combobox", "select"].includes(fieldType) &&
          optionType === "array" && (
            <>
              <h3>{label} Options</h3>
              <Options
                dataType={dataType}
                options={options}
                setOptions={(newOptions) => setValue("options", newOptions)}
              />
            </>
          )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`${s.fieldForm} grid gap-1`}
        >
          {(["file"].includes(inputType) ||
            ["select", "combobox"].includes(fieldType)) && (
            <Checkbox {...register("multiple")} label="Multiple" />
          )}

          {inputType === "calendar" && (
            <>
              <Combobox
                label="Date Window"
                name="dateWindow"
                control={control}
                options={[
                  { label: "All time", value: "allTime" },
                  {
                    label: "Past including Today",
                    value: "pastIncludingToday",
                  },
                  {
                    label: "Past excluding Today",
                    value: "pastExcludingToday",
                  },
                  {
                    label: "Future including Today",
                    value: "futureIncludingToday",
                  },
                  {
                    label: "Future excluding Today",
                    value: "futureExcludingToday",
                  },
                ]}
              />

              <Combobox
                label="Multiple Range"
                name="multipleRanges"
                control={control}
                options={[
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ]}
              />
            </>
          )}
        </form>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`flex gap-1 justify-center`}
        >
          <button className="btn" type="btn" onClick={clear}>
            Clear
          </button>
          <button className="btn">{edit ? "Update" : "Add"} Field</button>
        </form>
      </div>
    </div>
  );
};

const ProductFilterFields = ({
  name,
  value = [],
  setValue,
  collection,
  collections,
  productCollection,
}) => {
  const [formOpen, setFormOpen] = useState();
  return (
    <>
      <div className="flex justify-space-between align-center">
        <h3>{name}</h3>
        <button className="btn" onClick={() => setFormOpen(true)}>
          Update {name}
        </button>
      </div>

      <Table className={s.fields} columns={[{ label: "Field" }]}>
        {value.map((item, i) => (
          <tr key={i}>
            <td>{item}</td>
          </tr>
        ))}
      </Table>

      <Modal
        head
        label={`Update Fields`}
        open={formOpen}
        setOpen={() => {
          setFormOpen(false);
        }}
        className={s.nestedObjectFormModal}
      >
        <ProductFilterFieldsForm
          editCollection={collection}
          collections={collections}
          productCollection={productCollection}
          onSubmit={(newValues) => {
            setValue([...(value || []), ...newValues]);
            setFormOpen(false);
          }}
        />
      </Modal>
    </>
  );
};
const ProductFilterFieldsForm = ({ productCollection, onSubmit }) => {
  const { handleSubmit, control } = useForm();
  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values.fields))}
      className="grid gap-1 p-1"
    >
      <CustomRadio
        control={control}
        name="fields"
        className={s.itemColumnsRadio}
        multiple
        label="Fields"
        options={productCollection.fields
          .filter(
            (item) =>
              !(item.inputType === "file" || item.inputType === "calendar")
          )
          .map((item) => ({
            label: item.label,
            value: item.name,
          }))}
      />

      <div className="flex justify-center">
        <button className="btn">Update</button>
      </div>
    </form>
  );
};

const NestedObjectFields = ({
  name,
  value = [],
  setValue,
  collection,
  collections,
}) => {
  const [edit, setEdit] = useState(null);
  const [formOpen, setFormOpen] = useState(null);
  return (
    <>
      <div className="flex justify-space-between align-center">
        <h3>{name} Fields</h3>
        <button className="btn" onClick={() => setFormOpen(true)}>
          Add {name} Field
        </button>
      </div>
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
        placeholder="No fields yet."
      >
        {value.map((item, i) => (
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
                  callBack: () => {
                    setEdit(item);
                    setFormOpen(true);
                  },
                },
                {
                  icon: <FaRegTrashAlt />,
                  label: "Delete",
                  callBack: () =>
                    Prompt({
                      type: "confirmation",
                      message: `Are you sure you want to remove this Field?`,
                      callback: () => {
                        setValue(
                          value.filter((field) => field.name !== item.name)
                        );
                      },
                    }),
                },
              ]}
            />
          </tr>
        ))}
      </Table>

      <Modal
        head
        label={`${edit ? "Update" : "Add"} ${name} Field`}
        open={formOpen}
        setOpen={() => {
          setFormOpen(false);
          setEdit(null);
        }}
        className={s.nestedObjectFormModal}
      >
        <FieldForm
          key={edit ? "edit" : "add"}
          edit={edit}
          fields={value}
          editCollection={collection}
          collections={collections}
          productCollection={collections.find((c) => c?.name === "Product")}
          onSuccess={(newField) => {
            if (edit) {
              setValue(
                value.map((item) =>
                  item.name.toLowerCase() === newField.name.toLowerCase()
                    ? newField
                    : item
                )
              );
              setEdit(null);
            } else {
              setValue([...value, newField]);
            }
            setFormOpen(false);
          }}
          clear={() => setEdit(null)}
        />
      </Modal>
    </>
  );
};

const Options = ({ dataType, options, setOptions }) => {
  const [edit, setEdit] = useState(null);
  return (
    <section className={s.optionsWrapper}>
      <Table
        className={`${s.options}`}
        columns={[{ label: "Label" }, { label: "Value" }, { label: "Action" }]}
      >
        <tr className="inlineForm">
          <td>
            <OptionsForm
              dataType={dataType}
              edit={edit}
              onSuccess={(newOption) => {
                if (edit) {
                  setOptions(
                    (options || []).map((item) =>
                      item._id === newOption._id ? newOption : item
                    )
                  );
                } else {
                  setOptions([newOption, ...(options || [])]);
                }
                setEdit(null);
              }}
              clearForm={() => setEdit(null)}
            />
          </td>
        </tr>
        {options?.map((item, i) => (
          <tr key={i}>
            <td>{item.label}</td>
            <td>{item.value?.toString()}</td>
            <TableActions
              actions={[
                {
                  icon: <FaPencilAlt />,
                  label: "Edit",
                  callBack: () => {
                    setEdit(item);
                  },
                },
                {
                  icon: <FaRegTrashAlt />,
                  label: "Delete",
                  callBack: () =>
                    Prompt({
                      type: "confirmation",
                      message: `Are you sure you want to remove this Option?`,
                      callback: () => {
                        setOptions(
                          (options || []).filter(
                            (product) => product._id !== item._id
                          )
                        );
                      },
                    }),
                },
              ]}
            />
          </tr>
        ))}
      </Table>
    </section>
  );
};
const OptionsForm = ({ dataType, edit, onSuccess, clearForm }) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    resolver: useYup(optionsSchema),
  });
  useEffect(() => {
    reset({
      label: edit?.label || "",
      value: edit?.value || "",
    });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (dataType === "boolean") {
          values.value = ["1", 1, "true"].includes(values.value.toLowerCase());
        } else if (dataType === "number") {
          values.value = +values.value;
        }
        onSuccess({
          ...values,
          _id: edit?._id || Math.random().toString(36).substr(-8),
        });
        reset();
      })}
    >
      <Input {...register("label")} placeholder="Label" error={errors.label} />
      <Input {...register("value")} placeholder="Value" error={errors.value} />

      <section className="btns">
        <button className="btn clear border iconOnly" type="submit">
          {edit ? <FaCheck /> : <FaPlus />}
        </button>
        {edit && (
          <button
            className="btn clear border iconOnly"
            type="button"
            onClick={() => {
              clearForm();
              // reset();
            }}
          >
            <FaTimes />
          </button>
        )}
      </section>
    </form>
  );
};

export default Form;
