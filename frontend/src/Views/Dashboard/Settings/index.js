import { useContext, useEffect, useState } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import {
  Input,
  Textarea,
  FileInputNew,
  Tabs,
  CustomRadio,
  Combobox,
  MapAutoComplete,
  GoogleMap,
} from "Components/elements";
import * as yup from "yup";
import s from "./settings.module.scss";
import { useYup, useFetch } from "hooks";
import { FaTimes } from "react-icons/fa";
import { Prompt } from "Components/modal";
import { paths, endpoints } from "config";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import TermsAndConditions from "./terms";
import SiteConfig from "./siteConfig";
import Documents from "./documents";
import DynamicPages from "./dynamicPages";
import { BsList } from "react-icons/bs";

const businessInformationSchema = yup.object({
  name: yup.string().required(),
  phone: yup.string().required(),
  description: yup.string(),
  email: yup.string().required(),
  domain: yup.string().required(),
  // address: yup.string().required(),
});

const Settings = ({ setSidebarOpen }) => {
  const location = useLocation();
  const [next, setNext] = useState(location.state?.next);
  return (
    <div className={s.container}>
      <div className={`flex`}>
        <div
          className={`flex align-center pointer gap_5  ml-1`}
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <BsList style={{ fontSize: "1.75rem" }} />
          <h2>Settings</h2>
        </div>
      </div>

      <Tabs
        tabs={[
          {
            label: "Business Information",
            path: paths.settings.businessInformation,
          },
          { label: "Bank Detail", path: paths.settings.bankDetails },
          { label: "Owner Detail", path: paths.settings.ownerDetails },
          {
            label: "Terms & Conditions",
            path: paths.settings.termsAndConditions,
          },
          {
            label: "AI Chat Knowledge Base",
            path: paths.settings.aiChatKnowledgeBase,
          },
          { label: "Configurations", path: paths.settings.config },
          { label: "Site Configurations", path: paths.settings.siteConfig },
          { label: "Blogs", path: paths.settings.dynamicPages },
        ]}
      />
      <Routes>
        <Route
          path={paths.settings.businessInformation}
          element={<BusinessInformation next={next} />}
        />
        <Route
          path={paths.settings.bankDetails}
          element={<BankDetail next={next} />}
        />
        <Route
          path={paths.settings.ownerDetails}
          element={<OwnerDetails next={next} />}
        />
        <Route
          path={paths.settings.termsAndConditions}
          element={<TermsAndConditions next={next} />}
        />
        <Route path={paths.settings.config} element={<Config next={next} />} />
        <Route
          path={paths.settings.siteConfig}
          element={<SiteConfig next={next} />}
        />
        <Route
          path={paths.settings.aiChatKnowledgeBase}
          element={<Documents next={next} />}
        />
        <Route
          path={paths.settings.dynamicPages}
          element={<DynamicPages next={next} />}
        />
      </Routes>
    </div>
  );
};

const BusinessInformation = ({ next }) => {
  const { user, setUser, business, setBusiness } = useContext(SiteContext);
  const [goNext, setGoNext] = useState(false);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: useYup(businessInformationSchema),
  });
  const navigate = useNavigate();
  const logo = watch("logo");
  const [marker, setMarker] = useState(false);
  const { put: updateOwnerDetails, loading } = useFetch(
    business
      ? endpoints.businesses + `/${business.business?._id}`
      : endpoints.businessProfile
  );
  useEffect(() => {
    const client = business?.business || user;
    if (client) {
      reset({
        logo: client.logo ? [client.logo] : [],
        name: client.name || "",
        motto: client.motto || "",
        phone: client.phone || "",
        whatsappNumber: client.whatsappNumber || "",
        email: client.email || "",
        street: client.address?.street || "",
        address: {
          address: { ...client.address },
          formatted: client.address?.formatted || "",
        },
        latlng:
          client?.address?.latitude && client?.address?.longitude
            ? client?.address?.latitude + "," + client?.address?.longitude
            : "",
        description: client.description || "",
        gstin: client.gstin || "",
        pan: client.pan || "",
        ifsc: client.ifsc || "",
        domain: client.domain || "",
        chatbotDomain: client.chatbot?.domain || "",
        favicon: client.favicon ? [client.favicon] : [],
      });
      if (client?.address?.latitude && client?.address?.longitude) {
        setMarker(true);
      }
    }
  }, [user, business]);
  return (
    <form
      className="grid gap-1"
      onSubmit={handleSubmit((values) => {
        if (values.address) {
          values.address = {
            ...values.address.address,
            street: values.street,
            formatted: values.address.formatted,
            // latitude: values.latitude,
            // longitude: values.longitude,
          };
          if (values.latlng) {
            const [latitude, longitude] = values.latlng.split(",");
            values.address.latitude = latitude;
            values.address.longitude = longitude;
          }
          delete values.street;
          delete values.latlng;
        }
        let logo = values.logo[0];
        let favicon = values.favicon[0];

        const formData = new FormData();

        if (logo?.type) {
          formData.append(`logo`, logo);
        } else if (!logo) {
          formData.append(`logo`, "");
        }
        if (favicon?.type) {
          formData.append(`favicon`, favicon);
        } else if (!favicon) {
          formData.append(`favicon`, "");
        }

        formData.append(`name`, values.name);
        formData.append(`motto`, values.motto);
        formData.append(`phone`, values.phone);
        formData.append(`email`, values.email);
        formData.append(`address`, JSON.stringify(values.address));
        formData.append(`gstin`, values.gstin);
        formData.append(`pan`, values.pan);
        formData.append(`ifsc`, values.ifsc);
        formData.append(`domain`, values.domain);
        if (values.chatbotDomain) {
          formData.append(
            "chatbotDomain",
            values.chatbotDomain.replace(
              /^(?:https?:\/\/)?(?:www\.)?([^\/?]+)(?:\/[^?]+)?.*/,
              "$1"
            )
          );
        }
        formData.append(`whatsappNumber`, values.whatsappNumber);
        formData.append("description", values.description);

        updateOwnerDetails(formData)
          .then(({ data }) => {
            if (!data.success) {
              return Prompt({
                type: "error",
                message: data.message,
              });
            }
            if (business) {
              setBusiness((prev) => ({ ...prev, business: data.data }));
            } else {
              setUser(data.data);
            }
            Prompt({
              type: "information",
              message: "Updates have been saved.",
              ...(goNext && {
                callback: () =>
                  navigate(
                    paths.dashboard.replace("*", "") +
                      paths.settings.baseUrl.replace("*", "") +
                      paths.settings.bankDetails,
                    { state: { next: true } }
                  ),
              }),
            });
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
    >
      <h3>Business Information</h3>
      <FileInputNew
        thumbnail
        control={control}
        name="logo"
        label="Logo"
        accept="image/*"
      />
      <FileInputNew
        thumbnail
        label="Favicon"
        control={control}
        name="favicon"
        accept=".ico"
      />
      <Input label="Name" {...register("name")} error={errors.name} />
      <Input
        label="Business Motto"
        {...register("motto")}
        error={errors.motto}
      />
      <Input label="Phone" {...register("phone")} error={errors.phone} />
      <Input
        label="Whatapp Business Number"
        {...register("whatsappNumber")}
        error={errors.phone}
      />
      <Input label="Email" {...register("email")} error={errors.email} />
      <Input
        label="Street Address"
        {...register("street")}
        error={errors.street}
      />

      <MapAutoComplete
        label="City, State, Country"
        control={control}
        name="address"
        onChange={(e) => {
          const lat = e.place.geometry.location.lat();
          const lng = e.place.geometry.location.lng();
          setValue("latlng", lat + "," + lng);
        }}
      />

      <GoogleMap
        control={control}
        name="latlng"
        marker={marker}
        onClick={(e) => {
          setMarker(true);
        }}
      />

      <Textarea
        label="Description"
        {...register("description")}
        error={errors.description}
      />
      <Input label="Domain" {...register("domain")} error={errors.domain} />
      <Input
        label="Chatbot Domain"
        {...register("chatbotDomain")}
        error={errors.chatbotDomain}
      />
      <Input label="GSTIN" {...register("gstin")} error={errors.gstin} />
      <Input label="PAN" {...register("pan")} error={errors.pan} />
      <Input label="IFSC" {...register("ifsc")} error={errors.ifsc} />

      <div className="flex gap-1 justify-center">
        <button className="btn" disabled={loading}>
          Save Changes
        </button>
        {next && (
          <button
            className="btn"
            disabled={loading}
            onClick={() => setGoNext(true)}
          >
            Next
          </button>
        )}
      </div>
    </form>
  );
};

const BankDetail = ({ next }) => {
  const { user, setUser, business, setBusiness } = useContext(SiteContext);
  const [goNext, setGoNext] = useState(false);
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();
  useEffect(() => {
    const client = business?.business || user;
    reset({
      bankName: client?.bankDetails?.bankName || "",
      branch: client?.bankDetails?.branch || "",
      accNo: client?.bankDetails?.accNo || "",
      accName: client?.bankDetails?.accName || "",
    });
  }, [user, business]);

  const { put: updateBankDetail, loading } = useFetch(
    business
      ? endpoints.businesses + `/${business.business._id}`
      : endpoints.businessProfile
  );

  return (
    <form
      className="grid gap-1"
      onSubmit={handleSubmit((values) => {
        updateBankDetail({
          bankDetails: {
            bankName: values.bankName,
            branch: values.branch,
            accNo: values.accNo,
            accName: values.accName,
          },
        })
          .then(({ data }) => {
            if (!data.success) {
              return Prompt({
                type: "error",
                message: data.message,
              });
            }
            if (business) {
              setBusiness((prev) => ({ ...prev, business: data.data }));
            } else {
              setUser(data.data);
            }
            Prompt({
              type: "information",
              message: "Updates have been saved.",
              ...(goNext && {
                callback: () =>
                  navigate(
                    paths.dashboard.replace("*", "") +
                      paths.settings.baseUrl.replace("*", "") +
                      paths.settings.ownerDetails,
                    { state: { next: true } }
                  ),
              }),
            });
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
    >
      <h3>Bank Detail</h3>
      <Input
        label="Bank Name"
        {...register("bankName")}
        error={errors.bankName}
      />
      <Input label="Branch" {...register("branch")} error={errors.branch} />
      <Input label="Account No." {...register("accNo")} error={errors.accNo} />
      <Input
        label="Account Name"
        {...register("accName")}
        error={errors.accName}
      />

      <div className="flex gap-1 justify-center">
        <button className="btn" disabled={loading}>
          Save Changes
        </button>
        {next && (
          <button
            className="btn"
            disabled={loading}
            onClick={() => setGoNext(true)}
          >
            Next
          </button>
        )}
      </div>
    </form>
  );
};

const OwnerDetails = ({ next }) => {
  const { user, setUser, business, setBusiness } = useContext(SiteContext);
  const [goNext, setGoNext] = useState(false);
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const signature = watch("signature");

  const { put: updateOwnerDetails, loading } = useFetch(
    business
      ? endpoints.businesses + `/${business.business._id}`
      : endpoints.businessProfile
  );

  useEffect(() => {
    const client = business?.business || user;
    reset({
      ownerName: client?.ownerDetails?.name || "",
      ownerPhone: client?.ownerDetails?.phone || "",
      ownerEmail: client?.ownerDetails?.email || "",
      signature: client?.ownerDetails?.signature
        ? [client?.ownerDetails?.signature]
        : [],
    });
  }, [user, business]);

  return (
    <form
      className="grid gap-1"
      onSubmit={handleSubmit((values) => {
        let signature = values.signature[0];

        const formData = new FormData();

        if (signature?.type) {
          formData.append(`ownerSignature`, signature);
        } else if (!signature) {
          formData.append(`ownerDetails[signature]`, "");
        }

        formData.append(`ownerDetails[name]`, values.ownerName);
        formData.append(`ownerDetails[phone]`, values.ownerPhone);
        formData.append(`ownerDetails[email]`, values.ownerEmail);

        updateOwnerDetails(formData)
          .then(({ data }) => {
            if (!data.success) {
              return Prompt({ type: "error", message: data.message });
            }
            if (business) {
              setBusiness((prev) => ({ ...prev, business: data.data }));
            } else {
              setUser(data.data);
            }
            Prompt({
              type: "information",
              message: "Updates have been saved.",
              ...(goNext && {
                callback: () =>
                  navigate(
                    paths.dashboard.replace("*", "") +
                      paths.settings.baseUrl.replace("*", "") +
                      paths.settings.termsAndConditions,
                    { state: { next: true } }
                  ),
              }),
            });
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
    >
      <h3>Owner Detail</h3>
      <Input label="Name" {...register("ownerName")} error={errors.ownerName} />
      <Input
        label="Phone"
        {...register("ownerPhone")}
        error={errors.ownerPhone}
      />
      <Input
        label="Email"
        {...register("ownerEmail")}
        error={errors.ownerEmail}
      />
      <FileInputNew
        thumbnail
        control={control}
        name="signature"
        label="Signature"
        accept="image/*"
      />

      <div className="flex gap-1 justify-center">
        <button className="btn" disabled={loading}>
          Save Changes
        </button>
        {next && (
          <button
            className="btn"
            disabled={loading}
            onClick={() => setGoNext(true)}
          >
            Next
          </button>
        )}
      </div>
    </form>
  );
};

const configSchema = yup.object({
  nextInvoiceNo: yup
    .number()
    .min(1, "Invoice Number can not be less than 1")
    .required()
    .typeError("Enter a valid number"),
  nextPurchaseNo: yup
    .number()
    .min(1, "Invoice Number can not be less than 1")
    .required()
    .typeError("Enter a valid number"),
  nextReceiptNo: yup
    .number()
    .min(1, "Invoice Number can not be less than 1")
    .required()
    .typeError("Enter a valid number"),
  printCurrency: yup.string().max(3, "Currency can only be 3 characters long"),
});
const Config = ({ next }) => {
  const { config, setConfig } = useContext(SiteContext);
  const [goNext, setGoNext] = useState(false);
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: useYup(configSchema),
  });

  const [unitsOfMeasure, setUnitOfMeasure] = useState([]);

  const {
    get: getConfig,
    put: updateConfig,
    loading,
  } = useFetch(endpoints.userConfig);

  useEffect(() => {
    if (config) {
      reset({
        nextInvoiceNo: config.nextInvoiceNo,
        nextPurchaseNo: config.nextPurchaseNo,
        nextReceiptNo: config.nextReceiptNo,
        printQuoteCurrency:
          config?.printQuote?.currency || config.print.currency,
        printQuoteItemColumns:
          config?.printQuote?.itemColumns || config.print.itemColumns,
        printQuoteBusinessInfo: config.printQuote.businessInfo,
        printCurrency: config.print.currency,
        printItemColumns: config.print.itemColumns,
        printInvoiceNoSuffix: config.print.invoiceNoSuffix,
        printPurchaseNoSuffix: config.print.purchaseNoSuffix,
        numberSeparator: config?.numberSeparator,
      });
      setUnitOfMeasure(config.unitsOfMeasure);
    }
  }, [config]);

  useEffect(() => {
    getConfig()
      .then(({ data }) => {
        if (!data.success) {
          Prompt({
            type: "error",
            message: data.message,
          });
        }
        setConfig(data.data);
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);

  return (
    <form
      className="grid gap-1"
      onSubmit={handleSubmit((values) => {
        updateConfig({
          unitsOfMeasure,
          nextInvoiceNo: values.nextInvoiceNo,
          nextPurchaseNo: values.nextPurchaseNo,
          nextReceiptNo: values.nextReceiptNo,
          numberSeparator: values.numberSeparator,
          print: {
            itemColumns: values.printItemColumns,
            currency: values.printCurrency,
            invoiceNoSuffix: values.printInvoiceNoSuffix,
            purchaseNoSuffix: values.printPurchaseNoSuffix,
          },
          printQuote: {
            itemColumns: values.printItemColumns,
            currency: values.printCurrency,
            businessInfo: values.printQuoteBusinessInfo,
          },
        })
          .then(({ data }) => {
            if (!data.success) {
              return Prompt({ type: "error", message: data.message });
            }
            setConfig(data.data);
            Prompt({
              type: "information",
              message: "Updates have been saved.",
              ...(goNext && {
                callback: () =>
                  navigate(
                    paths.dashboard.replace("*", "") +
                      paths.settings.baseUrl.replace("*", "") +
                      paths.settings.siteConfig,
                    { state: { next: true } }
                  ),
              }),
            });
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
    >
      <section className="unitsOfMeasure">
        <label>Units Of Measure</label>
        <ul className="chips flex align-center">
          {unitsOfMeasure.map((unit, i) => (
            <li className="chip" key={i}>
              <span>{unit}</span>
              <button
                type="button"
                className="clear"
                onClick={() =>
                  setUnitOfMeasure((prev) => prev.filter((u) => u !== unit))
                }
              >
                <FaTimes />
              </button>
            </li>
          ))}
          <li>
            <UnitForm
              onSuccess={(unit) => {
                setUnitOfMeasure((prev) => [...new Set([...prev, unit])]);
              }}
            />
          </li>
        </ul>
      </section>

      <Input
        label="Next Invoice Number"
        {...register("nextInvoiceNo")}
        error={errors.nextInvoiceNo}
      />

      <Input
        label="Next Purchase Number"
        {...register("nextPurchaseNo")}
        error={errors.nextPurchaseNo}
      />

      <Input
        label="Next Receipt Number"
        {...register("nextReceiptNo")}
        error={errors.nextReceiptNo}
      />

      <Input
        label="Invoice No Suffix"
        {...register("printInvoiceNoSuffix")}
        error={errors.printInvoiceNoSuffix}
      />

      <Input
        label="Purchase No Suffix"
        {...register("printPurchaseNoSuffix")}
        error={errors.printPurchaseNoSuffix}
      />

      <Input
        label="Print Currency"
        {...register("printCurrency")}
        error={errors.printCurrency}
      />

      <Combobox
        label="Number Separator"
        control={control}
        name="numberSeparator"
        options={[
          { label: "Indian", value: "en-IN" },
          { label: "US", value: "en-US" },
        ]}
      />

      <CustomRadio
        control={control}
        name="printItemColumns"
        className={s.itemColumnsRadio}
        multiple
        label="Print Items Columns"
        options={[
          { label: "No", value: "no" },
          { label: "Product", value: "product" },
          { label: "Qty", value: "qty" },
          { label: "Unit", value: "unit" },
          { label: "Total", value: "total" },
        ]}
      />

      <Input
        label="Print Quote Currency"
        {...register("printQuoteCurrency")}
        error={errors.printQuoteCurrency}
      />

      <CustomRadio
        control={control}
        name="printQuoteItemColumns"
        className={s.itemColumnsRadio}
        multiple
        label="Print Quote Items Columns"
        options={[
          { label: "No", value: "no" },
          { label: "Product", value: "product" },
          { label: "Qty", value: "qty" },
          { label: "Unit", value: "unit" },
          { label: "Total", value: "total" },
        ]}
      />

      <CustomRadio
        control={control}
        name="printQuoteBusinessInfo"
        className={s.itemColumnsRadio}
        multiple
        label="Print Quote Business Information"
        options={[
          { label: "GSTIN", value: "gstin" },
          { label: "PAN", value: "pan" },
          { label: "IFSC", value: "ifsc" },
          { label: "Bank Name", value: "bank" },
          { label: "Branch Name", value: "branch" },
          { label: "Account Number", value: "accountNumber" },
          { label: "Address", value: "address" },
          { label: "phone", value: "phone" },
          { label: "email", value: "email" },
        ]}
      />

      <div className="flex gap-1 justify-center">
        <button className="btn" disabled={loading}>
          Save Changes
        </button>
        {next && (
          <button
            className="btn"
            disabled={loading}
            onClick={() => setGoNext(true)}
          >
            Next
          </button>
        )}
      </div>
    </form>
  );
};

const UnitForm = ({ onSuccess }) => {
  const [unit, setUnit] = useState("");
  return (
    <div className={s.unitForm}>
      <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
      <button
        type="button"
        className="btn"
        onClick={() => {
          if (unit) {
            onSuccess(unit);
            setUnit("");
          }
        }}
      >
        Add
      </button>
    </div>
  );
};

export default Settings;
