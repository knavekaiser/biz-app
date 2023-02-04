import { useState, useEffect, useContext, useRef } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import {
  Input,
  Textarea,
  FileInputNew,
  CalendarInput,
  DynamicTable,
  Combobox,
  Table,
  Select,
  CustomRadio,
  MobileNumberInput,
  moment,
} from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt, Modal } from "Components/modal";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import { findProperties } from "helpers";
import * as yup from "yup";
import s from "./payments.module.scss";
import { endpoints } from "config";

const MainForm = ({ collection, productCollection, edit, onSuccess }) => {
  const {
    post: saveData,
    put: updateData,
    loading,
  } = useFetch(`${endpoints.dynamic}/${collection.name}/${edit?._id || ""}`);

  return (
    <div className={`grid gap-1`}>
      <DynamicForm
        fields={collection.fields}
        productCollection={productCollection}
        edit={edit}
        loading={loading}
        onSubmit={(values) => {
          let payload = { ...values };

          findProperties("_id", payload).forEach((item) => {
            item.path.reduce((obj, key, i, arr) => {
              if (i === arr.length - 1 && obj[key].length <= 20) {
                delete obj[key];
              }
              return obj[key];
            }, payload);
          });

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
              if (field.dataType === "array") {
                for (const item of value) {
                  payload.append(`${field.name}`, item);
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
        }}
      />
    </div>
  );
};

const DynamicForm = ({
  fields: collectionFields,
  productCollection,
  edit,
  loading,
  onSubmit,
}) => {
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: useYup(
      yup.object({
        ...collectionFields
          .map((f) => {
            let field;
            if (["objectId", "string", "date"].includes(f.dataType)) {
              field = yup.string();
            }
            if (f.dataType === "number") {
              field = yup.number().typeError("Please enter a valid number");
            }
            if (f.inputType === "phone") {
              field = yup.string().phone("Please enter a valid phone number");
            }
            if (f.dataType === "array") {
              field = yup.array();
              if (f.min) {
                field = field.min(f.min, `At least ${f.min} items required`);
              }
            }
            if (f.required) {
              field = field.required(
                field.errorMessage || `${f.label} is required`
              );
            }
            return field;
          })
          .reduce((p, c, i) => {
            p[collectionFields[i]?.name] = c;
            return p;
          }, {}),
      })
    ),
  });

  const fields = collectionFields.map((field, i) => {
    if (field.dataType === "object" && field.fieldType === "collectionFilter") {
      const value = watch(field.name);
      return (
        <ProductFilterForm
          key={field.name}
          field={field}
          value={value}
          productCollection={productCollection}
          setValue={setValue}
        />
      );
    }
    if (field.dataType === "array" && field.dataElementType === "object") {
      const values = watch(field.name);
      return (
        <NestedObjectTable
          key={field.name}
          values={values}
          field={field}
          setValue={setValue}
        />
      );
    }
    if (field.inputType === "file") {
      return (
        <FileInputNew
          key={field.name}
          control={control}
          name={field.name}
          label={field.label}
          multiple={field.multiple}
          thumbnail
        />
      );
    }
    if (field.fieldType === "dateRange") {
      if (field.inputType === "calendar") {
        return (
          <CalendarInput
            key={field.name}
            control={control}
            label={field.label}
            name={field.name}
            dateWindow={field.dateWindow}
            required={field.required}
            disabledDates={field.disabledDates || []}
            multipleRanges={field.multipleRanges}
          />
        );
      }
    }
    if (field.fieldType === "input") {
      if (field.inputType === "phone") {
        return (
          <MobileNumberInput
            label={field.label}
            key={field.name}
            name={field.name}
            formOptions={{ required: field.required }}
            control={control}
          />
        );
      }
      return (
        <Input
          key={field.name}
          {...register(field.name)}
          type={field.inputType || "text"}
          label={field.label}
          required={field.required}
          error={errors[field.name]}
          autoFocus={i === 0}
        />
      );
    }
    if (field.fieldType === "textarea") {
      return (
        <Textarea
          key={field.name}
          {...register(field.name)}
          label={field.label}
          required={field.required}
          error={errors[field.name]}
          autoFocus={i === 0}
        />
      );
    }
    if (field.fieldType === "combobox") {
      return (
        <Combobox
          key={field.name}
          label={field.label}
          control={control}
          name={field.name}
          multiple={field.multiple}
          formOptions={{ required: field.required }}
          options={field.options || []}
        />
      );
    }
    if (field.fieldType === "select") {
      return (
        <Select
          key={field.name}
          control={control}
          label={field.label}
          {...(field.optionType === "predefined" && {
            options: field.options,
          })}
          {...(field.optionType === "collection" && {
            url: `${endpoints.dynamic}/${field.collection}`,
          })}
          getQuery={(inputValue, selected) => ({
            ...(inputValue && { [field.optionLabel]: inputValue }),
            ...(selected && { [field.optionValue]: selected }),
          })}
          handleData={(item) => ({
            label: item[field.optionLabel],
            value: item[field.optionValue],
          })}
          multiple={field.multiple}
          name={field.name}
          formOptions={{ required: field.required }}
          className={s.itemName}
        />
      );
    }
  });

  useEffect(() => {
    const _edit = { ...edit };
    if (edit) {
      collectionFields.forEach((field) => {
        if (field.inputType === "date") {
          _edit[field.name] = moment(_edit[field.name], "YYYY-MM-DD");
        } else if (field.inputType === "datetime-local") {
          _edit[field.name] = moment(_edit[field.name], "YYYY-MM-DD hh:mm");
        }
      });
    }
    reset(_edit);
  }, [edit]);

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({
          ...values,
          _id: edit?._id || Math.random().toString(36).substr(-8),
        })
      )}
      className={`${s.dynamicForm} grid gap-1 p-1`}
    >
      {fields}

      <div className="btns">
        <button className="btn" disabled={loading}>
          {edit ? "Update" : "Submit"}
        </button>
      </div>
    </form>
  );
};

const NestedObjectTable = ({ field, values = [], setValue }) => {
  const [formOpen, setFormOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  return (
    <section className={s.nestedTable} onSubmit={(e) => e.stopPropagation()}>
      <div className="flex justify-space-between align-center mb-1">
        <h3>{field.label}</h3>
        <button className="btn" type="button" onClick={() => setFormOpen(true)}>
          Add
        </button>
      </div>
      <DynamicTable
        fields={field.fields}
        data={values}
        actions={(item) => [
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
                message: `Are you sure you want to remove this Collection?`,
                callback: () => {
                  setValue(
                    field.name,
                    values.filter((i) => i._id !== item._id)
                  );
                },
              }),
          },
        ]}
      />
      <Modal
        head
        label={`${edit ? "Update" : "Add"} Item`}
        open={formOpen}
        setOpen={() => {
          setFormOpen(false);
          setEdit(null);
        }}
        className={s.nestedObjectFormModal}
      >
        <DynamicForm
          edit={edit}
          fields={field.fields}
          onSubmit={(newObj) => {
            if (edit) {
              setValue(
                field.name,
                values.map((item) => (item._id === newObj._id ? newObj : item))
              );
              setEdit(null);
            } else {
              setValue(field.name, [...values, newObj]);
            }
            setFormOpen(false);
          }}
        />
      </Modal>
    </section>
  );
};

const ProductFilterForm = ({ field, value, productCollection, setValue }) => {
  const [formOpen, setFormOpen] = useState(false);
  return (
    <section className={s.nestedTable} onSubmit={(e) => e.stopPropagation()}>
      <div className="flex justify-space-between align-center mb-1">
        <h3>{field.label} Filters</h3>
        <button className="btn" type="button" onClick={() => setFormOpen(true)}>
          Update {field.label}
        </button>
      </div>

      <Table
        className={s.fields}
        columns={[
          { label: "Field" },
          { label: "Data Type" },
          { label: "Filter Type" },
          { label: "value" },
          // { label: "Input Type" },
          // { label: "Required" },
        ]}
      >
        {Object.entries(value || {}).map(([key, value], i) => (
          <tr key={i}>
            <td>{key}</td>
            <td>
              {
                productCollection.fields.find((item) => item.name === key)
                  ?.dataType
              }
            </td>
            <td>{value.filterType}</td>
            <td>
              {value.filterType === "minMax" && (
                <>
                  Min: {value.min}; Max: {value.max}
                </>
              )}
              {value.filterType === "arrayContains" && (
                <>{value.array?.length || 0} items</>
              )}
              {value.filterType === "stringContains" && <>{value.text}</>}
            </td>
          </tr>
        ))}
      </Table>

      <Modal
        head
        label={`${field.label} Filters`}
        open={formOpen}
        setOpen={() => {
          setFormOpen(false);
        }}
        className={s.nestedObjectFormModal}
      >
        <ProductFilterFieldsForm
          productCollection={productCollection}
          value={value}
          onSubmit={(newObj) => {
            setValue(field.name, newObj);
            setFormOpen(false);
          }}
        />
      </Modal>
    </section>
  );
};
const ProductFilterFieldsForm = ({
  value = {},
  productCollection,
  onSubmit,
}) => {
  const {
    handleSubmit,
    register,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm();
  const fields = watch("fields");
  useEffect(() => {
    const formValues = {
      fields: Object.keys(value),
    };
    Object.entries(value).forEach(([key, value]) => {
      const field = productCollection.fields.find(
        (field) => field.name === key
      );
      if (!field) return;

      if (field.dataType === "number" && value.filterType === "minMax") {
        formValues[key + "___min"] = value.min || "";
        formValues[key + "___max"] = value.max || "";
      } else if (
        field.dataType === "string" &&
        ["input", "textarea"].includes(field.fieldType)
      ) {
        formValues[key] = value.text;
      } else if (field.fieldType === "combobox") {
        formValues[key] = value.array;
      } else if (field.fieldType === "select") {
        formValues[key] = value.array;
      }
    });
    reset(formValues);
  }, []);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        const data = {};
        Object.entries(values).forEach(([key, value]) => {
          let [fieldName, subLabel] = key.split("___");
          if (subLabel) {
            key = fieldName;
          }
          if (!values.fields.includes(key)) {
            return;
          }
          const field = productCollection.fields.find(
            (field) => field.name === key
          );
          if (!field) {
            return;
          }
          if (
            field.dataType === "string" &&
            ["input", "textarea"].includes(field.fieldType)
          ) {
            data[key] = {
              filterType: "stringContains",
              text: value,
            };
          } else if (field.dataType === "number") {
            data[fieldName] = {
              ...data[fieldName],
              filterType: "minMax",
              [subLabel]: +value,
            };
          } else if (
            ["string", "objectId"].includes(field.dataType) &&
            field.fieldType === "select"
          ) {
            data[key] = {
              filterType: "arrayContains",
              array: value,
            };
          }
        });
        onSubmit(data);
      })}
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

      {(fields || []).map((f, i) => {
        const field = productCollection.fields.find(
          (field) => field.name === f
        );
        if (!field) return;

        if (
          field.dataType === "string" &&
          ["input", "textarea"].includes(field.fieldType)
        ) {
          return (
            <Input
              key={i}
              {...register(field.name)}
              type={"text"}
              label={`${field.label} contains`}
              required={field.required}
              error={errors[field.name]}
            />
          );
        } else if (field.dataType === "number") {
          return (
            <div key={i} className="flex gap-1">
              <Input
                className="all-columns"
                {...register(field.name + "___min")}
                type={"number"}
                label={`Minimum ${field.label}`}
                required={field.required}
                error={errors[field.name + "___min"]}
              />
              <Input
                className="all-columns"
                {...register(field.name + "___max")}
                type={"number"}
                label={`Maximum ${field.label}`}
                required={field.required}
                error={errors[field.name + "___max"]}
              />
            </div>
          );
        } else if (
          // ["string", "objectId"].includes(field.dataType) &&
          field.fieldType === "select"
        ) {
          return (
            <Select
              key={i}
              control={control}
              label={field.label}
              multiple
              {...(field.optionType === "predefined" && {
                options: field.options,
              })}
              {...(field.optionType === "collection" && {
                url: `${endpoints.dynamic}/${field.collection}`,
              })}
              getQuery={(inputValue, selected) => ({
                ...(inputValue && { [field.optionLabel]: inputValue }),
                ...(selected && { [field.optionValue]: selected }),
              })}
              handleData={(item) => ({
                label: item[field.optionLabel],
                value: item[field.optionValue],
              })}
              name={field.name}
              formOptions={{ required: true }}
              className={s.itemName}
            />
          );
        } else if (
          // ["string", "objectId"].includes(field.dataType) &&
          field.fieldType === "combobox"
        ) {
          return (
            <Combobox
              key={i}
              label={field.label}
              control={control}
              name={field.name}
              multiple
              formOptions={{ required: true }}
              options={field.options || []}
            />
          );
        }
      })}

      <div className="flex justify-center">
        <button className="btn">Update</button>
      </div>
    </form>
  );
};

export default MainForm;
