import { useEffect, useContext, useState } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { paths, endpoints } from "config";
import { useYup, useFetch } from "hooks";
import { Prompt, Modal } from "Components/modal";
import { CustomRadio, Table, Combobox } from "Components/elements";
import s from "./settings.module.scss";

const ProductCard = () => {
  const [productEelementOptions, setProductElementOptions] = useState([]);
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
      elements: config?.siteConfig?.productCard || [],
      currency: config?.siteConfig?.currency || "",
      sidebarFilters: config?.siteConfig?.browsePage?.sidebarFilters || [],
    });
  }, [config]);

  useEffect(() => {
    if (productEelementOptions.length === 0) {
      getProductCollection()
        .then(({ data }) => {
          if (data.success) {
            return setProductElementOptions(
              data.data.fields.map((item) => ({
                label: item.label,
                value: item.name,
              }))
            );
          }
        })
        .catch((err) => Prompt({ type: "error", message: err.message }));
    }
  }, [config.siteConfig?.productCard]);

  return (
    <form
      className="grid gap-1"
      onSubmit={handleSubmit((values) => {
        updateConfig({
          ...config,
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
                .map((item, i, arr) => ({ ...item, order: arr.length - i }))
            : productEelementOptions
        }
      />

      {
        // elements?.includes("thumbnail") && <p>Thumbnail</p>
      }
      {
        // elements?.includes("title") && <p>Title</p>
      }
      {
        // elements?.includes("description") && <p>Description</p>
      }

      {
        // <h3>Currencies</h3>
        //   <Table columns={[{ label: "Currency" }, { label: "Symbol" }]}>
        //   {config.siteConfig?.currencies?.length > 0 ? (
        //     config.siteConfig.currencies.map((item, i) => (
        //       <tr key={i}>
        //         <td>{item.currency}</td>
        //         <td>{item.symbol}</td>
        //       </tr>
        //     ))
        //   ) : (
        //     <tr>
        //       <td>No Currency Found</td>
        //     </tr>
        //   )}
        // </Table>
      }

      <Combobox
        label="Currency"
        name="currency"
        watch={watch}
        options={[
          { label: "USD", value: "USD" },
          { label: "INR", value: "INR" },
        ]}
        register={register}
        setValue={setValue}
      />

      <Combobox
        label="Product Sidebar Filters"
        name="sidebarFilters"
        multiple
        watch={watch}
        options={[
          { label: "Category", value: "category" },
          { label: "Price Range", value: "priceRange" },
        ]}
        register={register}
        setValue={setValue}
      />

      <button className="btn">Save Changes</button>
    </form>
  );
};

const SiteConfig = () => {
  return <ProductCard />;
};

export default SiteConfig;
