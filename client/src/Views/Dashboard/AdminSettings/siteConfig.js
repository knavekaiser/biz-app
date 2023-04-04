import { useEffect, useContext, useState, useCallback } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { paths, endpoints } from "config";
import { useYup, useFetch } from "hooks";
import { Prompt, Modal } from "Components/modal";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import { findProperties } from "helpers";
import {
  Input,
  Combobox,
  Select,
  CustomRadio,
  Checkbox,
  Table,
  TableActions,
  FileInputNew,
} from "Components/elements";
import s from "./settings.module.scss";

const SiteConfig = () => {
  const [productCollection, setProductCollection] = useState(null);
  const [productEelementOptions, setProductElementOptions] = useState([]);
  const [productPageEelementOptions, setProductPageElementOptions] = useState(
    []
  );
  const [updateSidebarFilters, setUpdateSidebarFilters] = useState(false);
  const { config, setConfig } = useContext(SiteContext);
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
  const { get: getProductCollection, loading: gettingProductCollection } =
    useFetch(endpoints.collections + "/Product");

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
      viewWhatsApp: config?.siteConfig?.productViewPage?.viewWhatsApp || false,
      viewLandingPage:
        config?.siteConfig?.landingPage?.viewLandingPage || false,
      heroImages: config?.siteConfig?.landingPage?.hero?.slides || [],
      viewHeroSection:
        config?.siteConfig?.landingPage?.hero?.viewHeroSection || false,
      landingPageShelves: config?.siteConfig?.landingPage?.shelves || [],
      sidebarFiltersDefaultState:
        config?.siteConfig?.browsePage?.sidebarFiltersDefaultState ||
        "collapsed",
      footerElements: config?.siteConfig?.footer?.sections,
    });
  }, [config]);

  const sidebarFilters = watch("sidebarFilters");
  const viewLandingPage = watch("viewLandingPage");
  const whatsapp = watch("viewWhatsApp");

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
            fields.push({ value: "review", label: "Review" });
            if (config.businessType === "service") {
              fields.push({ value: "dateRange", label: "Date Range" });
            }
            setProductCollection(data.data);
            setProductElementOptions(
              fields
                .filter(
                  (item) => !["description", "dateRange"].includes(item.value)
                )
                .sort((a, b, i) => {
                  if (!config.siteConfig.productCard?.includes(a.value)) {
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
                .filter(
                  (item) =>
                    !["description", "whatsappNumber"].includes(item.value)
                )
                .sort((a, b) => {
                  if (
                    !config.siteConfig.productViewPage?.productElements?.includes(
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

  return (
    <form
      className="grid gap-1"
      onSubmit={handleSubmit((values) => {
        const payload = {
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
              sidebarFiltersDefaultState: values.sidebarFiltersDefaultState,
            },
            productViewPage: {
              viewWhatsApp: whatsapp,
              productElements: values.productViewElements.filter((item) =>
                productPageEelementOptions.find((opt) => opt.value === item)
              ),
              recommendationFilters: values.recommendationFilters,
              recommendationLimit: values.recommendationLimit,
            },
            landingPage: {
              viewLandingPage: viewLandingPage,
              hero: {
                viewHeroSection: values.viewHeroSection,
              },
              shelves: values.landingPageShelves,
            },
            footer: {
              sections: values.footerElements.map((section) => ({
                ...section,
                items: section.items.map((item) => ({
                  ...item,
                  condition: item.type === "dynamicPage",
                  ...(item.type === "dynamicPage" && {
                    files: (item.files || [])
                      .filter(
                        (item) =>
                          item.uploadFilePath || typeof item === "string"
                      )
                      .map((file) => file.uploadFilePath || file),
                  }),
                })),
              })),
            },
          },
        };
        findProperties("_id", payload).forEach((item) => {
          item.path.reduce((obj, key, i, arr) => {
            if (i === arr.length - 1 && obj[key].length <= 20) {
              delete obj[key];
            }
            return obj[key];
          }, payload);
        });
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          formData.append(key, JSON.stringify(value));
        });
        values.heroImages.forEach((file) => {
          if (file.type) {
            formData.append("siteConfig.landingPage.hero.slides", file);
          } else {
            formData.append(
              "siteConfig.landingPage.hero.slides",
              file.uploadFilePath || file
            );
          }
        });
        values.footerElements.forEach((section, i) => {
          section.items.forEach((item, j) => {
            item.files.forEach((file) => {
              if (file.type) {
                formData.append(
                  `dynamicPageFiles`,
                  file,
                  `siteConfig.footer.${section.title}.${item.label}.files___${file.name}`
                );
              } else {
                // formData.append(
                //   `siteConfig.footer.${section.title}.${item.label}.files`,
                //   file.uploadFilePath || file
                // );
              }
            });
          });
        });

        updateConfig(formData)
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
      <div>
        <div className="flex gap-1 justify-start align-center mb-1">
          <h5>Sidebar filters</h5>

          <button
            className="btn"
            type="button"
            onClick={() => setUpdateSidebarFilters(true)}
          >
            Update Sidebar Filters
          </button>

          <Combobox
            label="Sidebar filters default state"
            name="sidebarFiltersDefaultState"
            control={control}
            options={[
              { label: "Open", value: "open" },
              { label: "Collapsed", value: "collapsed" },
            ]}
          />
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
