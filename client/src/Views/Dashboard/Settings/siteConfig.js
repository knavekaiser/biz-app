import { useEffect, useContext, useState } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { paths, endpoints } from "config";
import { useYup, useFetch } from "hooks";
import { Prompt, Modal } from "Components/modal";
import { CustomRadio, Table, Combobox, Select } from "Components/elements";
import s from "./settings.module.scss";

const SiteConfig = () => {
  const [productCollection, setProductCollection] = useState(null);
  const [productEelementOptions, setProductElementOptions] = useState([]);
  const [productPageEelementOptions, setProductPageElementOptions] = useState(
    []
  );
  const [updateSidebarFilters, setUpdateSidebarFilters] = useState(false);
  const [
    updateRecommendationFilters,
    setUpdateRecommendationFilters,
  ] = useState(false);
  const { user, setUser, config, setConfig } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm();

  const { put: updateConfig, loading } = useFetch(endpoints.userConfig);
  const {
    get: getProductCollection,
    loading: gettingProductCollection,
  } = useFetch(endpoints.collections + "/Product");

  useEffect(() => {
    reset({
      businessType: config?.businessType || "",
      elements: config?.siteConfig?.productCard?.length
        ? config?.siteConfig?.productCard
        : [],
      productViewElements:
        config?.siteConfig?.productViewPage?.productElements || [],
      currency: config?.siteConfig?.currency || "",
      sidebarFilters: config?.siteConfig?.browsePage?.sidebarFilters || [],
      recommendationFilters:
        config?.siteConfig?.productViewPage?.recommendationFilters || [],
      recommendationLimit:
        config?.siteConfig?.productViewPage?.recommendationLimit,
      viewWhatsApp:
        config?.siteConfig?.productViewPage?.viewWhatsApp?.toString() ||
        "false",
    });
  }, [config]);

  const sidebarFilters = watch("sidebarFilters");
  const recommendationFilters = watch("recommendationFilters");

  useEffect(() => {
    if (
      config?.siteConfig?.productCard &&
      productEelementOptions.length === 0
    ) {
      getProductCollection({ query: { relatedCollections: true } })
        .then(({ data }) => {
          if (data.success) {
            const fields = data.data.fields
              .filter((item) => !["images", "title"].includes(item.name))
              .map((item) => {
                return {
                  label: item.label,
                  value: item.name,
                };
              });
            setProductCollection(data.data);
            setProductElementOptions(
              fields
                .sort((a, b, i) => {
                  if (!config.siteConfig.productCard.includes(a.value)) {
                    return 1;
                  }
                  return config.siteConfig.productCard.findIndex(
                    (i) => i === a.value
                  ) >
                    config.siteConfig.productCard.findIndex(
                      (i) => i === b.value
                    )
                    ? 1
                    : -1;
                })
                .reverse()
            );
            setProductPageElementOptions(
              fields
                .filter((item) => item.value !== "description")
                .sort((a, b, i) => {
                  if (
                    !config.siteConfig.productViewPage?.productElements.includes(
                      a.value
                    )
                  ) {
                    return 1;
                  }
                  return config.siteConfig.productViewPage?.productElements.findIndex(
                    (i) => i === a.value
                  ) >
                    config.siteConfig.productViewPage?.productElements.findIndex(
                      (i) => i === b.value
                    )
                    ? 1
                    : -1;
                })
                .reverse()
            );
          }
        })
        .catch((err) => Prompt({ type: "error", message: err.message }));
    }
  }, [config?.siteConfig?.productCard, productEelementOptions]);

  const whatsapp = watch("viewWhatsApp");

  return (
    <form
      className="grid gap-1"
      onSubmit={handleSubmit((values) => {
        updateConfig({
          ...config,
          businessType: values.businessType,
          siteConfig: {
            ...config.siteConfig,
            productCard: values.elements.filter((item) =>
              productEelementOptions.find((opt) => opt.value === item)
            ),
            currency: values.currency,
            browsePage: {
              ...config.siteConfig.browsePage,
              sidebarFilters: values.sidebarFilters,
            },
            productViewPage: {
              viewWhatsApp: whatsapp === "true",
              productElements: values.productViewElements.filter((item) =>
                productPageEelementOptions.find((opt) => opt.value === item)
              ),
              recommendationFilters: values.recommendationFilters,
              recommendationLimit: values.recommendationLimit,
            },
          },
        })
          .then(({ data }) => {
            if (data.success) {
              setConfig(data.data);
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
      <Combobox
        label="Business Type"
        name="businessType"
        control={control}
        options={[
          { label: "Product", value: "product" },
          { label: "Service", value: "service" },
        ]}
      />

      <Combobox
        label="Currency"
        name="currency"
        control={control}
        options={[
          { label: "USD", value: "USD" },
          { label: "INR", value: "INR" },
        ]}
      />

      <CustomRadio
        control={control}
        name="elements"
        multiple
        label="Product Card Elements (Move items to reorder)"
        sortable
        options={
          config?.siteConfig?.productCard?.length
            ? productEelementOptions
                .sort((a, b, i) => {
                  if (!config.siteConfig.productCard.includes(a.value)) {
                    return 1;
                  }
                  return config.siteConfig.productCard.findIndex(
                    (i) => i === a.value
                  ) >
                    config.siteConfig.productCard.findIndex(
                      (i) => i === b.value
                    )
                    ? 1
                    : -1;
                })
                .reverse()
                .map((item, i, arr) => ({
                  ...item,
                  order: arr.length - i,
                }))
            : productEelementOptions
        }
      />

      <h2>Prodcut View Page</h2>

      <Combobox
        label="Show WhatsApp Chat Button"
        name="viewWhatsApp"
        control={control}
        options={[
          { label: "Yes", value: "true" },
          { label: "No", value: "false" },
        ]}
      />
      {whatsapp === "true" && (
        <p className="subtitle1">
          Make sure to put a WhatsApp number in Business Information.
        </p>
      )}

      <CustomRadio
        control={control}
        name="productViewElements"
        multiple
        label="Product Page Elements (Move items to reorder)"
        sortable
        options={
          config?.siteConfig?.productViewPage?.productElements?.length
            ? productPageEelementOptions
                .sort((a, b, i) => {
                  if (
                    !config.siteConfig.productViewPage?.productElements.includes(
                      a.value
                    )
                  ) {
                    return 1;
                  }
                  return config.siteConfig.productViewPage?.productElements.findIndex(
                    (i) => i === a.value
                  ) >
                    config.siteConfig.productViewPage?.productElements.findIndex(
                      (i) => i === b.value
                    )
                    ? 1
                    : -1;
                })
                .reverse()
                .map((item, i, arr) => ({ ...item, order: arr.length - i }))
            : productPageEelementOptions
        }
      />

      <div>
        <div className="flex justify-space-between align-center mb-1">
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
          {sidebarFilters?.map((item, i) => (
            <tr key={i}>
              <td>{item.fieldName}</td>
              <td>{item.filterType}</td>
              <td>{item.filterStyle}</td>
            </tr>
          ))}
        </Table>
      </div>

      <div>
        <div className="flex justify-space-between align-center mb-1">
          <h5>Recommendation Filters</h5>
          <button
            className="btn"
            type="button"
            onClick={() => setUpdateRecommendationFilters(true)}
          >
            Update recommendation Filters
          </button>
        </div>
        <Table columns={[{ label: "Field" }, { label: "Oparator" }]}>
          {recommendationFilters?.map((item, i) => (
            <tr key={i}>
              <td>{item.fieldName}</td>
              <td>{item.oparator}</td>
            </tr>
          ))}
        </Table>
      </div>

      <Combobox
        label="Recommendation limit"
        name="recommendationLimit"
        control={control}
        options={[
          { label: "5", value: 5 },
          { label: "10", value: 10 },
          { label: "20", value: 20 },
          { label: "30", value: 30 },
        ]}
      />

      <Modal
        open={updateRecommendationFilters}
        head
        label="Update Recommendation Filters"
        className={s.recFilterModal}
        setOpen={() => setUpdateRecommendationFilters(false)}
      >
        <RecommendationFilters
          fields={productCollection?.fields?.filter(
            (item) =>
              !(
                ["file"].includes(item.inputType) ||
                (["input", "textarea"].includes(item.fieldType) &&
                  item.dataType === "string")
              )
          )}
          value={recommendationFilters}
          onSuccess={(values) => {
            setValue("recommendationFilters", values);
            setUpdateRecommendationFilters(false);
          }}
        />
      </Modal>

      <Modal
        open={updateSidebarFilters}
        head
        label="Update Sidebar Filters"
        setOpen={() => setUpdateSidebarFilters(false)}
      >
        <SidebarFilters
          fields={productCollection?.fields?.filter(
            (item) => !["file"].includes(item.inputType)
          )}
          value={sidebarFilters}
          onSuccess={(values) => {
            setValue("sidebarFilters", values);
            setUpdateSidebarFilters(false);
          }}
        />
      </Modal>

      <button className="btn">Save Changes</button>
    </form>
  );
};

const SidebarFilters = ({ fields = [], value = [], onSuccess }) => {
  const {
    handleSubmit,
    register,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm();
  const selectedFields = watch("fields");
  useEffect(() => {
    const data = {
      fields: value.map((item) => item.fieldName),
    };
    value.forEach((field) => {
      const { fieldName, ...options } = field;
      Object.entries(options).forEach(([key, value]) => {
        data[`${fieldName}`] = {};
        data[`${fieldName}`][key] = value;
      });
    });
    reset(data);
  }, []);
  return (
    <div onSubmit={(e) => e.stopPropagation()}>
      <form
        onSubmit={handleSubmit((values) => {
          const data = [];
          values.fields.forEach((f) => {
            const field = fields.find((field) => field.name === f);
            data.push({
              fieldName: f,
              ...(["input", "textarea"].includes(field.fieldType) && {
                filterType: values[f]?.filterType || "textSearch",
              }),
              ...(["select", "combobox"].includes(field.fieldType) && {
                filterStyle: values[f]?.filterStyle,
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
                  if (!value.includes(a.value)) {
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
          if (["input", "textarea"].includes(field.fieldType)) {
            if (field.dataType === "string") {
              return (
                <p key={i}>
                  <strong>{field.label}:</strong> Text Search
                </p>
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
                    ]}
                    formOptions={{ required: "Select an option" }}
                  />
                </div>
              );
            }
          } else if (["select", "combobox"].includes(field.fieldType)) {
            return (
              <div key={i}>
                <p className="mb_5">
                  <strong>{field.label}:</strong>
                </p>
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
              </div>
            );
          }
        })}

        <div className="flex justify-center">
          <button className="btn">Update</button>
        </div>
      </form>
    </div>
  );
};

const RecommendationFilters = ({ fields = [], value = [], onSuccess }) => {
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
  const [forceRender, setForceRender] = useState(Math.random());
  useEffect(() => {
    const data = {
      fields: value.map((item) => item.fieldName),
    };
    value.forEach((field) => {
      const { fieldName, ...options } = field;
      Object.entries(options).forEach(([key, value]) => {
        if (typeof value === "object") {
          Object.entries(value).forEach(([includeKey, includeValue]) => {
            data[`${fieldName}.${includeKey}`] = includeValue;
          });
          return;
        }
        data[`${fieldName}`] = {};
        data[`${fieldName}`][key] = value;
      });
    });
    reset(data);
  }, []);

  return (
    <div onSubmit={(e) => e.stopPropagation()}>
      <form
        onSubmit={handleSubmit((values) => {
          const data = [];
          values.fields.forEach((f) => {
            const field = fields.find((field) => field.name === f);
            data.push({
              fieldName: f,
              ...(["input"].includes(field.fieldType) &&
                field.dataType === "number" && {
                  oparator: values[f]?.oparator,
                }),
              ...(["select", "combobox"].includes(field.fieldType) && {
                oparator: values[f]?.oparator,
                includes: Object.entries(values[f])
                  .filter(([key, value]) => value?.length > 0)
                  .reduce((p, [k, v]) => {
                    p[k] = v;
                    return p;
                  }, {}),
              }),
            });
          });
          onSuccess(data);
        })}
        className={`p-1 grid gap-1`}
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
                  if (!value.includes(a.value)) {
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
          if (["input"].includes(field.fieldType)) {
            if (field.dataType === "number") {
              return (
                <div key={i}>
                  <p className="mb_5">
                    <strong>{field.label}:</strong>{" "}
                  </p>
                  <Combobox
                    control={control}
                    name={`${field.name}.oparator`}
                    label="Oparator"
                    options={[
                      { label: "Greater than", value: "greaterThan" },
                      { label: "Less than", value: "lessThan" },
                    ]}
                    formOptions={{ required: "Select an option" }}
                  />
                </div>
              );
            }
          } else if (["select", "combobox"].includes(field.fieldType)) {
            return (
              <div key={i}>
                <p className="mb_5">
                  <strong>{field.label} Mapping:</strong>
                </p>

                <Combobox
                  className="mb_5"
                  control={control}
                  name={`${field.name}.oparator`}
                  label="Oparator"
                  options={[
                    { label: `Match ${field.label}`, value: "match" },
                    { label: "Custom Mapping", value: "customMapping" },
                  ]}
                  formOptions={{ required: "Select an option" }}
                  onChange={() => {
                    setForceRender(Math.random());
                  }}
                />

                {getValues(`${field.name}.oparator`) === "customMapping" && (
                  <FieldMapper field={field} control={control} />
                )}
              </div>
            );
          }
        })}

        <div className="flex justify-center">
          <button className="btn">Update</button>
        </div>
      </form>
    </div>
  );
};

const FieldMapper = ({ field, control }) => {
  const [options, setOptions] = useState([]);
  const { get: getOptions } = useFetch(
    endpoints.dynamic + `/${field.collection || ""}`
  );
  useEffect(() => {
    getOptions().then(({ data }) => {
      if (data?.success) {
        setOptions(data.data);
      }
    });
  }, []);
  return (
    <div>
      <Table
        columns={[
          { label: `Viewed ${field.label}` },
          { label: `Filter for recommendation` },
        ]}
      >
        {options.map((opt) => (
          <tr key={opt._id}>
            <td>{opt[field.optionLabel]}</td>
            <td>
              <Select
                control={control}
                name={`${field.name}.${opt[field.optionValue]}`}
                multiple
                options={options.map((item) => ({
                  label: item[field.optionLabel],
                  value: item[field.optionValue],
                }))}
              />
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default SiteConfig;
