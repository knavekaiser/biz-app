import { useContext, useEffect, useState, useRef } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import {
  Input,
  Textarea,
  FileInput,
  Table,
  TableActions,
  Tabs,
  CustomRadio,
  Combobox,
} from "Components/elements";
import * as yup from "yup";
import s from "./settings.module.scss";
import { useYup, useFetch } from "hooks";
import { FaPencilAlt, FaRegTrashAlt, FaTimes } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import { paths, endpoints } from "config";
import { Routes, Route } from "react-router-dom";

const businessInformationSchema = yup.object({
  name: yup.string().required(),
  phone: yup.string().required(),
  // email: yup.string().required(),
  // address: yup.string().required(),
});

const Settings = () => {
  return (
    <div className={s.container}>
      <Tabs
        tabs={[
          { label: "Business Information", path: "business-information" },
          { label: "Bank Detail", path: "bank-details" },
          { label: "Owner Detail", path: "owner-details" },
          { label: "Terms & Conditions", path: "terms-and-conditions" },
          { label: "Configurations", path: "config" },
        ]}
      />
      <Routes>
        <Route
          path={paths.settings.businessInformation}
          element={<BusinessInformation />}
        />
        <Route path={paths.settings.bankDetails} element={<BankDetail />} />
        <Route path={paths.settings.ownerDetails} element={<OwnerDetails />} />
        <Route
          path={paths.settings.termsAndConditions}
          element={<TermsAndConditions />}
        />
        <Route path={paths.settings.config} element={<Config />} />
      </Routes>
    </div>
  );
};

const BusinessInformation = () => {
  const { user, setUser } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: useYup(businessInformationSchema),
  });
  const logo = watch("logo");
  const { put: updateOwnerDetails, loading } = useFetch(endpoints.profile);
  useEffect(() => {
    reset({
      logo: user.logo ? [user.logo] : [],
      name: user.name || "",
      motto: user.motto || "",
      phone: user.phone || "",
      email: user.email || "",
      address: user.address || "",
      gstin: user.gstin || "",
      pan: user.pan || "",
      ifsc: user.ifsc || "",
    });
  }, [user]);
  return (
    <form
      className="grid gap-1"
      onSubmit={handleSubmit((values) => {
        let logo = values.logo[0];

        const formData = new FormData();

        if (logo?.type) {
          formData.append(`logo`, logo);
        } else if (!logo) {
          formData.append(`logo`, "");
        }

        formData.append(`name`, values.name);
        formData.append(`motto`, values.motto);
        formData.append(`phone`, values.phone);
        formData.append(`email`, values.email);
        formData.append(`address`, values.address);
        formData.append(`gstin`, values.gstin);
        formData.append(`pan`, values.pan);
        formData.append(`ifsc`, values.ifsc);

        updateOwnerDetails(formData).then(({ data }) => {
          if (data.success) {
            setUser(data.data);
            Prompt({
              type: "information",
              message: "Updates have been saved.",
            });
          } else if (data.errors) {
            Prompt({
              type: "error",
              message: data.message,
            });
          }
        });
      })}
    >
      <h3>Business Information</h3>
      <FileInput
        thumbnail
        label="Logo"
        prefill={logo}
        onChange={(files) => {
          setValue("logo", files);
        }}
      />
      <Input label="Name" {...register("name")} error={errors.name} />
      <Input
        label="Business Motto"
        {...register("motto")}
        error={errors.motto}
      />
      <Input label="Phone" {...register("phone")} error={errors.phone} />
      <Input label="Email" {...register("email")} error={errors.email} />
      <Textarea
        label="Address"
        {...register("address")}
        error={errors.address}
      />
      <Input label="GSTIN" {...register("gstin")} error={errors.gstin} />
      <Input label="PAN" {...register("pan")} error={errors.pan} />
      <Input label="IFSC" {...register("ifsc")} error={errors.ifsc} />

      <button className="btn" disabled={loading}>
        Save Changes
      </button>
    </form>
  );
};

const BankDetail = () => {
  const { user, setUser } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const [activeTab, setActiveTab] = useState("business-information");
  useEffect(() => {
    reset({
      bankName: user?.bankDetails?.bankName || "",
      branch: user?.bankDetails?.branch || "",
      accNo: user?.bankDetails?.accNo || "",
      accName: user?.bankDetails?.accName || "",
    });
  }, [user]);

  const { put: updateBankDetail, loading } = useFetch(endpoints.profile);

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
        }).then(({ data }) => {
          if (data.success) {
            setUser(data.data);
            Prompt({
              type: "information",
              message: "Updates have been saved.",
            });
          } else if (data.errors) {
            Prompt({
              type: "error",
              message: data.message,
            });
          }
        });
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

      <button className="btn" disabled={loading}>
        Save Changes
      </button>
    </form>
  );
};

const OwnerDetails = () => {
  const { user, setUser } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const signature = watch("signature");

  const { put: updateOwnerDetails, loading } = useFetch(endpoints.profile);

  useEffect(() => {
    reset({
      ownerName: user?.ownerDetails?.name || "",
      ownerPhone: user?.ownerDetails?.phone || "",
      ownerEmail: user?.ownerDetails?.email || "",
      signature: user?.ownerDetails?.signature
        ? [user?.ownerDetails?.signature]
        : [],
    });
  }, [user]);

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

        updateOwnerDetails(formData).then(({ data }) => {
          if (data.success) {
            setUser(data.data);
            Prompt({
              type: "information",
              message: "Updates have been saved.",
            });
          }
        });
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
      <FileInput
        thumbnail
        label="Signature"
        prefill={signature}
        onChange={(files) => {
          setValue("signature", files);
        }}
      />

      <button className="btn" disabled={loading}>
        Save Changes
      </button>
    </form>
  );
};

const TermsAndConditions = () => {
  const { user, setUser } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const [terms, setTerms] = useState([]);

  const { put: updateTerms } = useFetch(endpoints.profile);

  useEffect(() => {
    setTerms(user.terms || []);
  }, [user]);

  return (
    <form
      className="grid gap-1"
      onSubmit={handleSubmit((values) => {
        updateTerms({ terms }).then(({ data }) => {
          if (data.success) {
            setUser((prev) => ({
              ...prev,
              terms,
            }));
            Prompt({
              type: "information",
              message: "Updates have been saved.",
            });
          } else if (data.errors) {
            Prompt({ type: "error", message: data.message });
          }
        });
      })}
    >
      <Terms terms={terms} setTerms={setTerms} />

      <button className="btn">Save Changes</button>
    </form>
  );
};

const Terms = ({ terms, setTerms }) => {
  const [edit, setEdit] = useState(null);
  const [addTerm, setAddTerm] = useState(false);
  return (
    <>
      <div className="flex justify-space-between align-center">
        <h3>Terms & Conditions</h3>
        <button type="button" className="btn" onClick={() => setAddTerm(true)}>
          Add New Term
        </button>
      </div>
      <Table
        className={s.terms}
        columns={[{ label: "Terms" }, { label: "Action" }]}
      >
        {terms.map((item, i) => (
          <tr key={i}>
            <td>{item}</td>
            <TableActions
              actions={[
                {
                  icon: <FaPencilAlt />,
                  label: "Edit",
                  callBack: () => {
                    setEdit(item);
                    setAddTerm(true);
                  },
                },
                {
                  icon: <FaRegTrashAlt />,
                  label: "Delete",
                  callBack: () =>
                    Prompt({
                      type: "confirmation",
                      message: `Are you sure you want to remove this Term?`,
                      callback: () => {
                        setTerms((prev) =>
                          prev.filter(
                            (product) =>
                              product.toLowerCase() !== item.toLowerCase()
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
      <Modal
        head
        label={edit ? "Update Term" : "Add Term"}
        open={addTerm}
        setOpen={setAddTerm}
        className={s.termFormModal}
      >
        <TermForm
          edit={edit}
          onSuccess={(newTerm) => {
            if (edit) {
              setTerms((prev) =>
                prev.map((t) =>
                  t.toLowerCase() === edit.toLowerCase() ? newTerm : t
                )
              );
              setEdit(null);
            } else {
              setTerms((prev) => [...prev, newTerm]);
            }
            setAddTerm(false);
          }}
        />
      </Modal>
    </>
  );
};
const termSchema = yup.object({
  term: yup.string().required(),
});

const TermForm = ({ edit, onSuccess }) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    resolver: useYup(termSchema),
  });
  const formRef = useRef();

  useEffect(() => {
    reset({ term: edit || "" });
  }, [edit]);
  return (
    <form
      ref={formRef}
      className={s.termForm}
      onSubmit={handleSubmit((values) => {
        onSuccess(values.term);
      })}
    >
      <Textarea label="Term" {...register("term")} error={errors.term} />
      <div className="btns">
        <button
          className="btn"
          type="button"
          onClick={handleSubmit((values) => {
            onSuccess(values.term);
          })}
        >
          Submit
        </button>
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
  printCurrency: yup.string().max(3, "Currency can only be 3 characters long"),
});
const Config = () => {
  const { config, setConfig } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: useYup(configSchema),
  });

  const [unitsOfMeasure, setUnitOfMeasure] = useState([]);

  const { get: getConfig, put: updateConfig, loading } = useFetch(
    endpoints.userConfig
  );

  useEffect(() => {
    if (config) {
      reset({
        nextInvoiceNo: config.nextInvoiceNo,
        printCurrency: config.print.currency,
        printItemColumns: config.print.itemColumns,
        printInvoiceNoSuffix: config.print.invoiceNoSuffix,
        numberSeparator: config?.numberSeparator,
      });
      setUnitOfMeasure(config.unitsOfMeasure);
    }
  }, [config]);

  useEffect(() => {
    getConfig().then(({ data }) => {
      if (data.success) {
        setConfig(data.data);
      } else if (data.errors) {
        Prompt({
          type: "error",
          message: data.message,
        });
      }
    });
  }, []);

  return (
    <form
      className="grid gap-1"
      onSubmit={handleSubmit((values) => {
        updateConfig({
          unitsOfMeasure,
          nextInvoiceNo: values.nextInvoiceNo,
          numberSeparator: values.numberSeparator,
          print: {
            itemColumns: values.printItemColumns,
            currency: values.printCurrency,
            invoiceNoSuffix: values.printInvoiceNoSuffix,
          },
        }).then(({ data }) => {
          if (data.success) {
            setConfig(data.data);
            Prompt({
              type: "information",
              message: "Updates have been saved.",
            });
          } else {
            Prompt({
              type: "error",
              message: data.message,
            });
          }
        });
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
        label="Print Invoice No Suffix"
        {...register("printInvoiceNoSuffix")}
        error={errors.printInvoiceNoSuffix}
      />

      <Input
        label="Print Currency"
        {...register("printCurrency")}
        error={errors.printCurrency}
      />

      <Combobox
        label="Number Separator"
        name="numberSeparator"
        watch={watch}
        options={[
          { label: "Indian", value: "en-IN" },
          { label: "US", value: "en-US" },
        ]}
        register={register}
        setValue={setValue}
      />

      <CustomRadio
        className={s.itemColumnsRadio}
        multiple
        register={register}
        name="printItemColumns"
        watch={watch}
        setValue={setValue}
        label="Print Items Columns"
        options={[
          { label: "Invoice No", value: "no" },
          { label: "Product", value: "product" },
          { label: "Qty", value: "qty" },
          { label: "Unit", value: "unit" },
          { label: "Total", value: "total" },
        ]}
      />

      <button className="btn" disabled={loading}>
        Save Changes
      </button>
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
