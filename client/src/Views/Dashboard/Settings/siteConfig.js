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
  const [updateShelves, setUpdateShelves] = useState(false);
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
      viewWhatsApp: config?.siteConfig?.productViewPage?.viewWhatsApp || false,
      viewLandingPage:
        config?.siteConfig?.landingPage?.viewLandingPage || false,
      heroImages: config?.siteConfig?.landingPage?.hero?.slides || [],
      viewHeroSection:
        config?.siteConfig?.landingPage?.hero?.viewHeroSection || false,
      landingPageShelves: config?.siteConfig?.landingPage?.shelves || [],
    });
  }, [config]);

  const sidebarFilters = watch("sidebarFilters");
  const recommendationFilters = watch("recommendationFilters");
  const viewLandingPage = watch("viewLandingPage");
  const viewHeroSection = watch("viewHeroSection");
  const whatsapp = watch("viewWhatsApp");
  const landingPageShelves = watch("landingPageShelves");

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

      <h2>Landing Page</h2>

      <Combobox
        label="View Landing Page"
        name="viewLandingPage"
        control={control}
        options={[
          { label: "Yes", value: true },
          { label: "No", value: false },
        ]}
      />

      {viewLandingPage && (
        <>
          <h4>Hero Section</h4>

          <Combobox
            label="View Hero Section"
            name="viewHeroSection"
            control={control}
            options={[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ]}
          />

          {viewHeroSection && (
            <FileInputNew
              thumbnail
              multiple
              control={control}
              name="heroImages"
              label="Hero Images"
            />
          )}

          <LandingPageShelves
            fields={productCollection?.fields?.filter(
              (item) => !["file"].includes(item.inputType)
            )}
            shelves={landingPageShelves}
            onChange={(shelves) => {
              setValue("landingPageShelves", shelves);
              setUpdateShelves(false);
            }}
          />
        </>
      )}

      <h2>Product View Page</h2>

      <Combobox
        label="Show WhatsApp Chat Button"
        name="viewWhatsApp"
        control={control}
        options={[
          { label: "Yes", value: true },
          { label: "No", value: false },
        ]}
      />
      {whatsapp && (
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

const LandingPageShelves = ({
  fields = [],
  shelves = [],
  // shelves: defaultShelves = [],
  value = [],
  onChange,
}) => {
  // const [shelves, setShelves] = useState([]);
  const [edit, setEdit] = useState(null);
  const [addShelf, setAddShelf] = useState(false);
  // useEffect(() => {
  // onChange(shelves);
  // }, [shelves]);

  // useEffect(() => {
  //   console.log(JSON.stringify(defaultShelves), JSON.stringify(shelves));
  //   if (JSON.stringify(defaultShelves) !== JSON.stringify(shelves)) {
  //     // setShelves(defaultShelves);
  //   }
  // }, [defaultShelves]);

  return (
    <div
      onSubmit={(e) => {
        e.stopPropagation();
      }}
      className="grid gap-1"
    >
      <div className="flex justify-space-between align-center">
        <h5>Shelves</h5>
        <button className="btn" type="button" onClick={() => setAddShelf(true)}>
          Add Shelf
        </button>
      </div>
      <Table
        columns={[
          { label: "Tilte" },
          { label: "Product Count" },
          { label: "Filters" },
          { label: "Actions" },
        ]}
      >
        {shelves?.map((item, i) => (
          <tr key={i}>
            <td>{item.title}</td>
            <td>{item.productCount}</td>
            <td>{item.productFilters.length}</td>
            <TableActions
              actions={[
                {
                  icon: <FaPencilAlt />,
                  label: "Edit",
                  callBack: () => {
                    setEdit(item);
                    setAddShelf(true);
                  },
                },
                {
                  icon: <FaRegTrashAlt />,
                  label: "Delete",
                  callBack: () =>
                    Prompt({
                      type: "confirmation",
                      message: `Are you sure you want to remove this Shelf?`,
                      callback: () => {
                        onChange(
                          shelves.filter((shelf) => item._id !== shelf._id)
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
        open={addShelf}
        setOpen={() => {
          setAddShelf(false);
          setEdit(null);
        }}
        head
        label={edit ? "Edit" : "Add" + " Shelf"}
        className={s.landingPageShelveFormModal}
      >
        <ShelfForm
          edit={edit}
          fields={fields}
          onSubmit={(newShelf) => {
            if (edit) {
              onChange(
                shelves.map((shelf) =>
                  newShelf._id === shelf._id ? newShelf : shelf
                )
              );
              setEdit(null);
            } else {
              onChange([...shelves, newShelf]);
            }
            setAddShelf(false);
          }}
        />
      </Modal>
    </div>
  );
};

const landingPageShelveSchema = yup.object({
  title: yup.string().required(),
  productFilters: yup
    .array()
    .min(1, "Please add at least one product filter")
    .required("Please add at least one product filter"),
  productCount: yup
    .number()
    .min(2, "Please enter more than 1")
    .required()
    .typeError("Please enter a valid number"),
});
const ShelfForm = ({ fields = [], edit, onSubmit }) => {
  const {
    handleSubmit,
    control,
    register,
    watch,
    setValue,
    reset,
    formState: { errors },
    clearErrors,
  } = useForm({
    resolver: useYup(landingPageShelveSchema),
  });
  const [updateFilters, setUpdateFilters] = useState(false);

  const submit = useCallback((values) => {
    onSubmit({
      ...values,
      _id: edit?._id || Math.random().toString(36).substr(-8),
    });
  }, []);

  const productFilters = watch("productFilters");

  useEffect(() => {
    reset({ ...edit });
  }, [edit]);
  return (
    <div onSubmit={(e) => e.stopPropagation()} className={`p-1 grid gap-1`}>
      <form onSubmit={handleSubmit(submit)} className="grid gap-1">
        <Input label="Title" {...register("title")} error={errors.title} />

        <Input
          label="Number of Products"
          type="number"
          {...register("productCount")}
          error={errors.productCount}
        />

        <Checkbox label="Horizontal" {...register("horizontalSlide")} />

        <div className="flex justify-space-between align-center">
          <h5>Product Filters</h5>
          <button
            className="btn"
            type="button"
            onClick={() => setUpdateFilters(true)}
          >
            Add/Update Filters
          </button>
        </div>

        {errors.productFilters && (
          <p className="error">{errors.productFilters.message}</p>
        )}
        <Table columns={[{ label: "Field" }, { label: "Oparator/Value" }]}>
          {productFilters?.map((item, i) => (
            <tr key={i}>
              <td>{item.fieldName}</td>
              <td>
                {item.filterType} {item.value}
              </td>
            </tr>
          ))}
        </Table>
      </form>

      <Modal
        open={updateFilters}
        edit={updateFilters}
        head
        label="Update Filters"
        setOpen={setUpdateFilters}
      >
        <SidebarFilters
          fields={fields}
          value={productFilters}
          onSuccess={(values) => {
            setValue("productFilters", values);
            setUpdateFilters(null);
            clearErrors("productFilters");
          }}
          includeValue
        />
      </Modal>

      <form onSubmit={handleSubmit(submit)}>
        <div className="flex justify-center">
          <button className="btn">Submit</button>
        </div>
      </form>
    </div>
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
  if (includeValue) {
    for (var i = 0; i < fields.length; i++) {
      const field = fields[i];
      const value = watch(`${field.name}.filterType`);
    }
  }
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
    <div onSubmit={(e) => e.stopPropagation()}>
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
                    ]}
                    formOptions={{ required: "Select an option" }}
                  />
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
            if (!field) return;
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
          if (!field) return null;
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
