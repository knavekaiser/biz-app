import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CalendarInput,
  Checkbox,
  Combobox,
  CustomRadio,
  FileInputNew,
  Input,
  MobileNumberInput,
  Select,
  Table,
  TableActions,
  Textarea,
  moment,
} from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Modal, Prompt } from "Components/modal";
import * as yup from "yup";
import s from "./store.module.scss";
import { endpoints } from "config";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";

const Form = ({ edit, onSuccess }) => {
  const [_fields, set_fields] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const {
    handleSubmit,
    register,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: useYup(
      yup.object({
        start: yup.string().required().typeError("Please select start date"),
        end: yup.string().required().typeError("Please select start date"),
        category: yup.string().required("field is required"),
      })
    ),
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [productSchema, setProductSchema] = useState(null);

  const {
    post: addStore,
    put: updateStore,
    loading,
  } = useFetch(endpoints.stores + `/${edit?._id || ""}`);

  const business = watch("business");
  const category = watch("category");
  const subcategory = watch("subcategory");
  const products = watch("products");
  const featured = watch("featured");

  const { get: getCategories, loading: loadingCategories } = useFetch(
    endpoints.adminDynamic + "/Store Category"
  );
  const { get: getSubcategories, loading: loadingAdSchemas } = useFetch(
    endpoints.adminDynamic + "/Store Subcategory"
  );

  useEffect(() => {
    getCategories()
      .then(({ data }) => {
        if (data.success) {
          if (data.data.length > 0) {
            setCategories(data.data);
          } else {
            return Prompt({
              type: "error",
              message: "Please add at least one category to proceed.",
            });
          }
        } else {
          return Prompt({ type: "error", message: data.message });
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);

  useEffect(() => {
    getSubcategories({
      query: { category: category },
    })
      .then(({ data }) => {
        if (data.success) {
          setSubcategories(data.data);
          if (edit?.subcategory) {
            setProductSchema(
              data.data.find((item) => item.name === edit?.subcategory) || null
            );
          }
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, [category]);

  const startDate = watch("start");
  const endDate = watch("end");

  useEffect(() => {
    reset({
      ...edit,
      featured: edit?.featured || false,
      products: edit?.products || [],
      business: edit?.business?._id || "",
      order: edit?.order || [],
      start: edit?.start ? moment(edit.start, "YYYY-MM-DD") : "",
      end: edit?.end ? moment(edit.end, "YYYY-MM-DD") : "",
    });
  }, [edit]);
  return (
    <div className={`grid gap-1 p-1`}>
      <form
        onSubmit={handleSubmit((values) => {
          delete values.image;
          const payload = { ...values };
          values.products.forEach((product, i) => {
            if (product.image?.type) {
              payload[`products__${i}__image`] = product.image;
            }
          });
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
          (edit ? updateStore : addStore)(formData)
            .then(({ data }) => {
              if (!data.success) {
                return Prompt({ type: "error", message: data.message });
              }
              onSuccess(data.data);
            })
            .catch((err) => Prompt({ type: "error", message: err.message }));
        })}
        className={`${s.mainForm} grid gap-1`}
      >
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
          name="business"
          // onChange={(e) => {
          //   if (!e?.value) {
          //     setValue("subcategory", "");
          //   }
          // }}
          formOptions={{ required: true }}
        />

        {business && (
          <Select
            disabled={edit?._id}
            control={control}
            label="Category"
            options={categories.map((item) => ({
              label: item.name,
              value: item.name,
            }))}
            name="category"
            onChange={(e) => {
              if (!e?.value) {
                setValue("subcategory", "");
              }
            }}
            formOptions={{ required: true }}
          />
        )}

        {category && (
          <Select
            disabled={edit?._id}
            control={control}
            label="Subcategory"
            options={subcategories
              .filter((item) => item.category?.name === category)
              .map((item) => ({
                label: item.name,
                value: item.name,
                fields: item.fields,
              }))}
            name="subcategory"
            onChange={(e) => {
              if (e.value) {
                setProductSchema(
                  subcategories.find((item) => item.name === e.value)
                );
                set_fields(e.fields || []);
              }
            }}
            formOptions={{ required: true }}
          />
        )}

        {category && subcategory && (
          <div className="grid gap-1">
            <Input
              type="date"
              label="Start Date*"
              max={endDate}
              {...register("start")}
              error={errors.start}
            />
            <Input
              type="date"
              label="End Date*"
              min={startDate}
              {...register("end")}
              error={errors.end}
            />
            <Checkbox label="Featured" {...register("featured")} />
            <div className="flex justify-space-between align-center">
              <h3>Products</h3>
              {((products || []).length < 1 || featured) && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => setEditProduct(true)}
                >
                  Add Product
                </button>
              )}
            </div>
            <Table
              columns={[
                { label: "Title" },
                { label: "Image" },
                { label: "Actions" },
              ]}
            >
              {(products || []).map((product) => (
                <tr key={product._id}>
                  <td>{product.title}</td>
                  <td>
                    <img
                      src={
                        typeof product.image === "string"
                          ? product.image
                          : URL.createObjectURL(product.image)
                      }
                    />
                  </td>
                  <TableActions
                    actions={[
                      {
                        icon: <FaPencilAlt />,
                        label: "Update",
                        onClick: () => {
                          setEditProduct(product);
                        },
                      },
                      {
                        icon: <FaTrashAlt />,
                        label: "Delete",
                        onClick: () =>
                          Prompt({
                            type: "confirmation",
                            message: `Are you sure you want to remove this product?`,
                            callback: () => {
                              setValue(
                                "products",
                                products.filter((i) => i._id !== product._id)
                              );
                            },
                          }),
                      },
                    ]}
                  />
                </tr>
              ))}
            </Table>
          </div>
        )}

        {category && subcategory && _fields.length > 0 && (
          <CustomRadio
            control={control}
            name="order"
            multiple
            label="Card Elements (Move items to reorder)"
            sortable
            options={_fields
              .filter((item) => !["title", "images"].includes(item.name))
              .sort((a, b, i) => {
                if (!(edit?.order || []).includes(a.name)) {
                  return 1;
                }
                return (edit?.order || []).findIndex((i) => i === a.name) >
                  (edit?.order || []).findIndex((i) => i === b.name)
                  ? 1
                  : -1;
              })
              .reverse()
              .map((item, i, arr) => ({
                // ...item,
                label: item.label,
                value: item.name,
                order: arr.length - i,
              }))}
          />
        )}

        <div className="btns">
          <button className="btn" disabled={loading}>
            {edit ? "Update" : "Submit"}
          </button>
        </div>
      </form>

      <Modal
        open={editProduct}
        setOpen={() => setEditProduct(null)}
        head
        label={`${edit?._id ? "Update" : "Add"} Product`}
        className={s.productForm}
      >
        <ProductForm
          _fields={_fields}
          business={business}
          edit={editProduct?._id ? editProduct : null}
          onSuccess={(newProduct) => {
            setValue(
              "products",
              editProduct?._id
                ? products.map((item) =>
                    item._id === newProduct._id ? newProduct : item
                  )
                : [...products, newProduct]
            );
            setEditProduct(null);
          }}
        />
      </Modal>
    </div>
  );
};

const ProductForm = ({ _fields, business, edit, onSuccess }) => {
  const {
    handleSubmit,
    register,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: useYup(
      yup.object({
        ..._fields
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
            p[_fields[i]?.name] = c;
            return p;
          }, {}),
        url: yup.string(),
      })
    ),
  });

  const fields = _fields.map((field, i) => {
    if (field.dataType === "object" && field.fieldType === "collectionFilter") {
      return null;
      // const value = watch(field.name);
      // return (
      //   <ProductFilterForm
      //     key={field.name}
      //     field={field}
      //     value={value}
      //     productCollection={productCollection}
      //     setValue={setValue}
      //   />
      // );
    }
    if (
      ["array", "variantArray"].includes(field.dataType) &&
      field.dataElementType === "object"
    ) {
      return null;
      // const values = watch(field.name);
      // return (
      //   <NestedObjectTable
      //     collection={collection}
      //     key={field.name}
      //     values={values}
      //     field={field}
      //     setValue={setValue}
      //   />
      // );
    }
    if (field.inputType === "file") {
      return (
        <FileInputNew
          key={field.name}
          control={control}
          name={field.name}
          label={field.label}
          multiple={field.name === "images" ? false : field.multiple}
          formOptions={{ required: field.required }}
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
            options: field.options || [],
          })}
          {...(field.optionType === "collection" && {
            url: `${endpoints.adminDynamic}/${field.collection}`,
          })}
          getQuery={(inputValue, selected) => ({
            business,
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
    reset({
      ...edit,
      images: edit?.image ? [edit?.image] : [],
    });
  }, [edit]);

  return (
    <div>
      <form
        className="grid gap-1 p-1"
        onSubmit={handleSubmit((values) => {
          if (values.images?.[0]) {
            values.image = values.images[0];
            delete values.images;
          }
          onSuccess({
            ...values,
            _id: edit?._id || Math.random().toString(32).substr(-8),
          });
        })}
      >
        {fields}
        <Input label="URL" {...register("url")} />

        <div className="btns">
          <button className="btn">{edit ? "Update" : "Submit"}</button>
        </div>
      </form>
    </div>
  );
};

export default Form;
