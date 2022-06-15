import { useContext, useEffect, useState, useRef } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import {
  Input,
  Textarea,
  FileInput,
  Table,
  TableActions,
} from "Components/elements";
import * as yup from "yup";
import s from "./settings.module.scss";
import { useYup } from "hooks";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";

const userSchema = yup.object({
  name: yup.string().required(),
  phone: yup.string().required(),
  // email: yup.string().required(),
  // address: yup.string().required(),
});

const Settings = () => {
  const { user, setUser } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: useYup(userSchema),
  });
  const [terms, setTerms] = useState([]);
  const logo = watch("logo");
  const signature = watch("signature");
  useEffect(() => {
    reset({
      logo: user.logo ? [user.logo] : [],
      name: user.name || "",
      moto: user.moto || "",
      phone: user.phone || "",
      email: user.email || "",
      address: user.address || "",
      gstin: user.gstin || "",
      pan: user.pan || "",
      ifsc: user.ifsc || "",
      bankName: user?.bankDetail?.bankName || "",
      branch: user?.bankDetail?.branch || "",
      accNo: user?.bankDetail?.accNo || "",
      accName: user?.bankDetail?.accName || "",
      ownerName: user?.owner?.name || "",
      ownerPhone: user?.owner?.phone || "",
      ownerEmail: user?.owner?.email || "",
      signature: user?.owner?.signature ? [user?.owner?.signature] : [],
    });
    setTerms(user.terms || []);
  }, [user]);
  return (
    <form
      className={s.container}
      onSubmit={handleSubmit((values) => {
        let logo = values.logo[0];
        if (logo?.type) {
          logo = URL.createObjectURL(logo);
        }
        let signature = values.signature[0];
        if (signature?.type) {
          signature = URL.createObjectURL(signature);
        }
        setUser({
          name: values.name,
          moto: values.moto,
          phone: values.phone,
          email: values.email,
          address: values.address,
          bankDetail: {
            bankName: values.bankName,
            branch: values.branch,
            accNo: values.accNo,
            accName: values.accName,
          },
          owner: {
            name: values.ownerName,
            phone: values.ownerPhone,
            email: values.ownerEmail,
            signature: signature,
          },
          logo,
          gstin: values.gstin,
          pan: values.pan,
          ifsc: values.ifsc,
          terms,
        });
        Prompt({
          type: "information",
          message: "Updates have been saved.",
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
      <Input label="Business Moto" {...register("moto")} error={errors.moto} />
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

export default Settings;
