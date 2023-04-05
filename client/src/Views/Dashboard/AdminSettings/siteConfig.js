import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { endpoints } from "config";
import { useFetch } from "hooks";
import { Prompt, Modal } from "Components/modal";
import {
  Input,
  Combobox,
  Select,
  CustomRadio,
  Table,
} from "Components/elements";

const SiteConfig = () => {
  const [fields, setFields] = useState([]);
  const [updateSidebarFilters, setUpdateSidebarFilters] = useState(false);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm();

  const [storeConfig, setStoreConfig] = useState(null);
  const {
    get: getConfig,
    put: updateConfig,
    loading,
  } = useFetch(endpoints.storeConfig);

  const [categories, setCategories] = useState([]);

  const { get: getCategories } = useFetch(endpoints.homeCategories);

  useEffect(() => {
    reset({
      sidebarFilters: storeConfig?.sidebarFilters || [],
    });
  }, [storeConfig]);

  const category = watch("category");
  const subCategory = watch("subCategory");

  const sidebarFilters = watch("sidebarFilters");

  useEffect(() => {
    getConfig()
      .then(({ data }) => {
        if (data.success) {
          setStoreConfig(data.data);
        } else {
          Prompt({ type: "error", message: data.message });
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
    getCategories()
      .then(({ data }) => {
        if (data.success) {
          setCategories(data.data);
        } else {
          Prompt({ type: "error", message: data.message });
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);

  return (
    <form
      className="grid gap-1"
      onSubmit={handleSubmit((values) => {
        const payload = { sidebarFilters: values.sidebarFilters };

        updateConfig(payload)
          .then(({ data }) => {
            if (data.success) {
              setStoreConfig(data.data);
              Prompt({
                type: "information",
                message: "Updates have been saved.",
              });
            } else {
              Prompt({ type: "error", message: data.message });
            }
          })
          .catch((err) => Prompt({ type: "error", data: err.message }));
      })}
    >
      <div className="flex gap-1 justify-center align-center mb-1">
        <Select
          label="Category"
          control={control}
          name="category"
          options={categories.map((item) => ({
            label: item.name,
            value: item.name,
          }))}
          onChange={() => setValue("subCategory", "")}
        />

        <Select
          label="Sub Category"
          control={control}
          name="subCategory"
          options={(
            categories.find((item) => item.name === category)?.subCategories ||
            []
          ).map((item) => ({
            label: item.name,
            value: item.name,
            fields: item.fields,
          }))}
          onChange={(opt) => {
            setFields(
              (opt.fields || []).filter(
                (item) =>
                  !(
                    ["file"].includes(item.inputType) ||
                    ["whatsappNumber"].includes(item.name)
                  )
              )
            );
          }}
        />
      </div>

      {category && subCategory && (
        <div>
          <div className="flex gap-1 justify-space-between align-center mb-1">
            <h5>Sidebar filters</h5>

            <button
              className="btn"
              type="button"
              onClick={() => setUpdateSidebarFilters(true)}
            >
              Update Sidebar Filters
            </button>
          </div>
          <Table
            columns={[
              { label: "Field" },
              { label: "Filter Type" },
              { label: "Filter Style" },
            ]}
          >
            {sidebarFilters
              ?.find(
                (item) =>
                  item.category === category && item.subCategory === subCategory
              )
              ?.filters?.map((item, i) => (
                <tr key={i}>
                  <td>{item.fieldName}</td>
                  <td>{item.filterType}</td>
                  <td>{item.filterStyle}</td>
                </tr>
              ))}
          </Table>
        </div>
      )}

      <Modal
        open={updateSidebarFilters}
        head
        label="Update Sidebar Filters"
        setOpen={() => setUpdateSidebarFilters(false)}
      >
        <SidebarFilters
          fields={fields}
          value={
            sidebarFilters?.find(
              (item) =>
                item.category === category && item.subCategory === subCategory
            )?.filters
          }
          onSuccess={(values) => {
            setValue("sidebarFilters", [
              ...sidebarFilters.filter(
                (item) =>
                  !(
                    item.category === category &&
                    item.subCategory === subCategory
                  )
              ),
              { category, subCategory, filters: values },
            ]);
            setUpdateSidebarFilters(false);
          }}
        />
      </Modal>

      <button className="btn">Save Changes</button>
    </form>
  );
};

const SidebarFilters = ({
  fields = [],
  value = [],
  onSuccess,
  includeValue,
}) => {
  const {
    handleSubmit,
    register,
    control,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm();
  const selectedFields = watch("fields");
  // if (includeValue) {
  for (var i = 0; i < fields.length; i++) {
    const field = fields[i];
    const value = watch(`${field.name}.filterType`);
  }
  // }
  useEffect(() => {
    const data = {
      fields: value.map((item) => item.fieldName),
    };
    value.forEach((field) => {
      const { fieldName, ...options } = field;
      Object.entries(options).forEach(([key, value]) => {
        data[fieldName] = { ...data[fieldName] };
        if (value !== undefined) {
          data[fieldName][key] = value;
        }
      });
    });
    reset(data);
  }, []);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        const data = [];
        values.fields.forEach((f) => {
          const field = fields.find((field) => field.name === f);
          if (!field) return;
          data.push({
            fieldName: f,
            ...(["input", "textarea"].includes(field.fieldType) && {
              filterType: values[f]?.filterType || "textSearch",
              ...(includeValue && {
                ...(values[f]?.filterType !== "minMax" && {
                  value: values[f]?.value,
                }),
                ...(values[f]?.filterType === "minMax" && {
                  min: values[f]?.min,
                  max: values[f]?.max,
                }),
              }),
            }),
            ...(["slider", "range"].includes(values[f]?.filterType) && {
              min: values[f]?.min,
              max: values[f]?.max,
            }),
            ...(["select", "combobox"].includes(field.fieldType) && {
              filterStyle: values[f]?.filterStyle,
              ...(includeValue && { value: values[f]?.value }),
            }),
          });
        });
        onSuccess(data);
      })}
      className="p-1 grid gap-1"
    >
      <CustomRadio
        control={control}
        name="fields"
        multiple
        label="Filter Fields"
        sortable
        options={(value.length
          ? fields
              .sort((a, b, i) => {
                if (!value?.includes(a.value)) {
                  return 1;
                }
                return value.findIndex((i) => i === a.value) >
                  value.findIndex((i) => i === b.value)
                  ? 1
                  : -1;
              })
              .reverse()
              .map((item, i, arr) => ({ ...item, order: arr.length - i }))
          : fields
        ).map((item) => ({
          label: item.label,
          value: item.name,
          data: item,
        }))}
      />

      {selectedFields?.map((f, i) => {
        const field = fields.find((field) => field.name === f);
        if (!field) return null;
        if (["input", "textarea"].includes(field.fieldType)) {
          if (field.dataType === "string") {
            return (
              <div key={i}>
                <p>
                  <strong>{field.label}:</strong> Text Search
                </p>
                {includeValue && (
                  <Input label="Value" {...register(`${field.name}.value`)} />
                )}
              </div>
            );
          } else if (field.dataType === "number") {
            return (
              <div key={i}>
                <p className="mb_5">
                  <strong>{field.label}:</strong>{" "}
                </p>
                <Combobox
                  control={control}
                  name={`${field.name}.filterType`}
                  label="Filter Style"
                  options={[
                    { label: "Min-Max", value: "minMax" },
                    { label: "Exact Match", value: "match" },
                    { label: "Range", value: "range" },
                    // { label: "Slider", value: "slider" },
                  ]}
                  formOptions={{ required: "Select an option" }}
                />
                {!includeValue &&
                  ["slider", "range"].includes(
                    getValues(`${field.name}.filterType`)
                  ) && (
                    <>
                      <Input
                        type="number"
                        label="Min"
                        {...register(`${field.name}.min`, {
                          required: "Please enter a value",
                        })}
                        error={errors[field.name]?.min}
                      />
                      <Input
                        type="number"
                        label="Max"
                        {...register(`${field.name}.max`, {
                          required: "Please enter a value",
                        })}
                        error={errors[field.name]?.max}
                      />
                    </>
                  )}
                {includeValue && (
                  <>
                    {getValues(`${field.name}.filterType`) === "minMax" && (
                      <>
                        <Input
                          type="number"
                          label="Minimum"
                          {...register(`${field.name}.min`)}
                        />
                        <Input
                          type="number"
                          label="Maximum"
                          {...register(`${field.name}.max`)}
                        />
                      </>
                    )}
                    {getValues(`${field.name}.filterType`) === "match" && (
                      <Input
                        type="number"
                        label="Value"
                        {...register(`${field.name}.value`)}
                      />
                    )}
                  </>
                )}
              </div>
            );
          }
        } else if (["select", "combobox"].includes(field.fieldType)) {
          return (
            <div key={i}>
              <p className="mb_5">
                <strong>{field.label}:</strong>
              </p>

              {includeValue ? (
                <Select
                  label="Value"
                  multiple
                  control={control}
                  name={`${field.name}.value`}
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
                />
              ) : (
                <Combobox
                  control={control}
                  name={`${field.name}.filterStyle`}
                  label="Filter Style"
                  options={[
                    { label: "List", value: "list" },
                    { label: "Dropdown", value: "dropdown" },
                  ]}
                  formOptions={{ required: "Select an option" }}
                />
              )}
            </div>
          );
        }
      })}

      <div className="flex justify-center">
        <button className="btn">Update</button>
      </div>
    </form>
  );
};

export default SiteConfig;
