import { useState, useEffect, useContext } from "react";
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
  RichText,
  Checkbox,
  TableActions,
} from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt, Modal } from "Components/modal";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import { findProperties } from "helpers";
import * as yup from "yup";
import s from "./payments.module.scss";
import { endpoints } from "config";
import { SiteContext } from "SiteContext";

const MainForm = ({ collection, productCollection, edit, onSuccess }) => {
  const {
    post: saveData,
    put: updateData,
    loading,
  } = useFetch(
    `${endpoints.adminDynamic}/${collection.name}/${edit?._id || ""}`
  );

  return (
    <div className={`grid gap-1`}>
      <DynamicForm
        collection={collection}
        fields={collection.fields}
        productCollection={productCollection}
        edit={edit}
        loading={loading}
        onSubmit={(values) => {
          let payload = { ...values };

          if (collection.name === "Product" && "variants" in payload) {
            payload.variants = JSON.stringify(payload.variants);
          }

          if (collection.fields.some((field) => field.dataType === "object")) {
            collection.fields
              .filter((item) => item.dataType === "object")
              .forEach((field) => {
                if (values[field.name]) {
                  payload[field.name] = JSON.stringify(values[field.name]);
                }
              });
          }

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
              if (collection.name === "Product" && field.name === "variants") {
                return;
              }
              const value = values[field.name];
              if (value === undefined) {
                return;
              }
              if (field.inputType === "file" && value.length) {
                for (const file of value) {
                  payload.append(`${field.name}`, file.uploadFilePath || file);
                }
                return;
              }
              if (["array", "variantArray"].includes(field.dataType)) {
                for (const item of value) {
                  payload.append(`${field.name}`, item);
                }
                return;
              }
              if (field.dataType === "object") {
                payload.append(`${field.name}`, JSON.stringify(value));
                return;
              }

              return payload.append(field.name, value);
            });
            if (collection.name === "Product" && "variants" in values) {
              payload.append("variants", JSON.stringify(values.variants));
            }
          }
          (edit ? updateData : saveData)(payload)
            .then(({ data }) => {
              if (!data.success) {
                return Prompt({ type: "error", message: data.message });
              }
              onSuccess(data.data);
            })
            .catch((err) => Prompt({ type: "error", message: err.message }));
        }}
      />
    </div>
  );
};

const DynamicForm = ({
  collection,
  fields: collectionFields,
  productCollection,
  edit,
  loading,
  onSubmit,
}) => {
  const [_fields, set_fields] = useState([]);
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    control,
    getValues,
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
            if (["array", "variantArray"].includes(f.dataType)) {
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

  const fields = (
    collection?.name === "Product" ? _fields : collectionFields
  ).map((field, i) => {
    if (collection?.name === "Product" && field.name === "variants") {
      return null;
    }
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
    if (
      ["array", "variantArray"].includes(field.dataType) &&
      field.dataElementType === "object"
    ) {
      const values = watch(field.name);
      return (
        <NestedObjectTable
          collection={collection}
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
    if (field.fieldType === "richText") {
      return (
        <RichText
          key={field.name}
          control={control}
          name={field.name}
          autoFocus={i === 0}
          label={field.label}
          required={field.required}
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
            options: field.options || [],
          })}
          {...(field.optionType === "collection" && {
            url: `${endpoints.adminDynamic}/${field.collection}`,
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

  const addVariant = watch("addVariant");
  const category = watch("category");

  useEffect(() => {
    const _edit = { ...edit };
    if (edit) {
      collectionFields.forEach((field) => {
        if (field.inputType === "date") {
          _edit[field.name] = moment(_edit[field.name], "YYYY-MM-DD");
        } else if (field.inputType === "datetime-local") {
          _edit[field.name] = moment(_edit[field.name], "YYYY-MM-DD hh:mm");
        } else if (
          field.dataType === "objectId" &&
          typeof edit[field.name] === "object"
        ) {
          _edit[field.name] = edit[field.name][field.optionValue];
        } else if (
          field.dataElementType === "objectId" &&
          typeof (edit[field.name] || [])[0] === "object"
        ) {
          _edit[field.name] = edit[field.name].map(
            (item) => item[field.optionValue]
          );
        } else if (
          field.name === "variants" &&
          collection?.name === "Product"
        ) {
          _edit.addVariant = !!edit.variants?.length;
        }
      });
    }
    reset(_edit);
  }, [edit]);
  useEffect(() => {
    if (category) {
      set_fields(
        collectionFields.filter(
          (item) => !item.category || item.category === category
        )
      );
    } else {
      set_fields(collectionFields.filter((item) => item.name === "category"));
    }
  }, [category]);

  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (collection?.name === "Product") {
          const fields = _fields.map((item) => item.name);
          const data = {};
          Object.entries(values)
            .filter(([key, value]) => fields.includes(key))
            .forEach(([key, value]) => {
              data[key] = value;
            });
          onSubmit({
            ...data,
            _id: edit?._id || Math.random().toString(36).substr(-8),
          });
        } else {
          onSubmit({
            ...values,
            _id: edit?._id || Math.random().toString(36).substr(-8),
          });
        }
      })}
      className={`${s.dynamicForm} grid gap-1 p-1`}
    >
      {fields}

      {collection?.name === "Product" &&
        category &&
        collection?.fields.some((item) => "variantArray" === item.dataType) && (
          <Checkbox {...register("addVariant")} label="Add Variant" />
        )}

      {addVariant && (
        <Variants
          collection={collection}
          setValue={setValue}
          getValues={getValues}
        />
      )}

      <div className="btns">
        <button className="btn" disabled={loading}>
          {edit ? "Update" : "Submit"}
        </button>
      </div>
    </form>
  );
};

const Variants = ({ collection, setValue, getValues }) => {
  const [formOpen, setFormOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [variants, setVariants] = useState(getValues("variants") || []);
  const [fields, setFields] = useState(
    collection.fields.filter((item) => item.dataType === "variantArray")
  );

  return (
    <div className={s.productVariants}>
      <div className="flex justify-space-between mb-1">
        <h3>Product Variants</h3>
        <button className="btn" type="button" onClick={() => setFormOpen(true)}>
          Add Variant
        </button>
      </div>

      <Table
        columns={[
          ...fields.map((item) => ({ label: item.label })),
          { label: "Price" },
          { label: "Images" },
          { label: "Actions" },
        ]}
      >
        {variants.map((item, i) => (
          <tr key={i}>
            <td>{item[fields[0]?.name]}</td>
            <td>{item[fields[1]?.name]}</td>
            <td>{item.price}</td>
            <td>{(item.images || []).length}</td>
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
                      message: `Are you sure you want to remove this Variant?`,
                      callback: () => {
                        setVariants(variants.filter((i) => i._id !== item._id));
                        setValue(
                          "variants",
                          variants.filter((i) => i._id !== item._id)
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
        label={`${edit ? "Update" : "Add"} Item`}
        open={formOpen}
        setOpen={() => {
          setFormOpen(false);
          setEdit(null);
        }}
        className={s.nestedObjectFormModal}
      >
        <VariantForm
          edit={edit}
          fields={fields}
          images={getValues("images")}
          onSubmit={(newObj) => {
            if (edit) {
              setVariants(
                variants.map((item) =>
                  item._id === newObj._id ? newObj : item
                )
              );
              setValue(
                "variants",
                variants.map((item) =>
                  item._id === newObj._id ? newObj : item
                )
              );
              setEdit(null);
            } else {
              setVariants([...variants, newObj]);
              setValue("variants", [...variants, newObj]);
            }
            // setValues
            setFormOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};
const VariantForm = ({ edit, fields, images, onSubmit }) => {
  const { handleSubmit, control, register, reset, errors } = useForm({
    resolver: useYup(
      yup.object({
        price: yup.number().typeError("Please enter a valid number"),
        // yup.string()
      })
    ),
  });
  useEffect(() => {
    if (edit) {
      reset({ ...edit });
    }
  }, []);

  const _fields = fields.map((field, i) => {
    if (field.fieldType === "combobox") {
      return (
        <Combobox
          key={field.name}
          label={field.label}
          control={control}
          name={field.name}
          // multiple={field.multiple}
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
            url: `${endpoints.adminDynamic}/${field.collection}`,
          })}
          getQuery={(inputValue, selected) => ({
            ...(inputValue && { [field.optionLabel]: inputValue }),
            ...(selected && { [field.optionValue]: selected }),
          })}
          handleData={(item) => ({
            label: item[field.optionLabel],
            value: item[field.optionValue],
          })}
          // multiple={field.multiple}
          name={field.name}
          formOptions={{ required: field.required }}
          className={s.itemName}
        />
      );
    }
  });
  return (
    <form
      className={`${s.variantForm} p-1 grid gap-1`}
      onSubmit={handleSubmit((values) => {
        onSubmit({
          ...values,
          _id: edit?._id || Math.random().toString(36).substr(-8),
        });
      })}
    >
      <CustomRadio
        control={control}
        label="Images"
        name={`images`}
        className={s.variantImages}
        multiple
        selectedClassName={s.selected}
        options={images
          .filter(
            (item) => typeof item === "string" || "uploadFilePath" in item
          )
          .map((item) => {
            if (typeof item === "string") {
              return { value: item };
            }
            if ("uploadFilePath" in item) {
              return { value: item.uploadFilePath };
            }
            if ("type" in item && item.type.startsWith("image")) {
              const url = URL.createObjectURL(item);
              return { value: url };
            }
          })}
        renderItem={(opt) => <img src={opt.value} />}
      />

      {_fields}

      <Input label="Price Difference" type="number" {...register("price")} />

      <div className="btns">
        <button className="btn">{edit ? "Update" : "Submit"}</button>
      </div>
    </form>
  );
};

const NestedObjectTable = ({ collection, field, values = [], setValue }) => {
  const [formOpen, setFormOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const {
    config: { siteConfig },
  } = useContext(SiteContext);
  const orderFields =
    collection.name === "Order"
      ? collection.fields
          .find((item) => item.name === "products")
          .fields.filter((item) => !["product", "variant"].includes(item.name))
      : null;
  console.log(orderFields, values);
  return (
    <section className={s.nestedTable} onSubmit={(e) => e.stopPropagation()}>
      <div className="flex justify-space-between align-center mb-1">
        <h3>{field.label}</h3>
        {!(collection.name === "Order" && field.name === "products") && (
          <button
            className="btn"
            type="button"
            onClick={() => setFormOpen(true)}
          >
            Add
          </button>
        )}
      </div>
      {collection.name === "Order" && field.name === "products" ? (
        <>
          <ul className={s.products}>
            {(values || []).map((item, i) => (
              <li key={i} className={s.product}>
                <div className={s.thumbnail}>
                  <img src={(item.variant?.images || item.product.images)[0]} />
                </div>
                <div className={s.productDetail}>
                  <h3>{item.product?.title}</h3>
                  {(orderFields || []).map((field) => (
                    <p key={field.name}>
                      <strong>{field.label}</strong>:{" "}
                      <span>{item[field.name]}</span>
                    </p>
                  ))}
                </div>
                <span className={s.price}>
                  {siteConfig?.currency}{" "}
                  {(
                    (item.product.price + (item.variant?.price || 0)) *
                    (item.qty || 1)
                  ).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
          <hr />
          <p className={s.subtotal}>
            Subtotal ({values.reduce((p, c) => p + (c.qty || 1), 0)} item):{" "}
            <strong>
              {siteConfig.currency +
                " " +
                values
                  .reduce(
                    (p, c) =>
                      p +
                      (c.product.price + (c.variant?.price || 0)) *
                        (c.qty || 1),
                    0
                  )
                  .toLocaleString()}
            </strong>
          </p>
        </>
      ) : (
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
      )}

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
                url: `${endpoints.adminDynamic}/${field.collection}`,
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
