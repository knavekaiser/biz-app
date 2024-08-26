import { useEffect, useContext, useState } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { paths, endpoints } from "config";
import { useYup, useFetch } from "hooks";
import { Prompt, Modal } from "Components/modal";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import { findProperties } from "helpers";
import { Input, Combobox, Table, TableActions } from "Components/elements";
import s from "./settings.module.scss";
import { useNavigate } from "react-router-dom";

const SiteConfig = () => {
  const [addReport, setAddReport] = useState(false);
  const { config, setConfig } = useContext(SiteContext);
  const { handleSubmit, reset, watch, setValue } = useForm();

  const { put: updateConfig, loading } = useFetch(endpoints.userConfig);
  const [editSection, setEditSection] = useState(null);

  useEffect(() => {
    reset({
      //
    });
  }, [config]);

  const footerElements = watch("footerElements");

  return (
    <form
      className="grid gap-1"
      onSubmit={handleSubmit((values) => {
        const payload = {
          ...config,
          businessType: values.businessType,
          siteConfig: {
            ...config?.siteConfig,
            //
          },
        };

        updateConfig(payload)
          .then(({ data }) => {
            if (!data.success) {
              return Prompt({ type: "error", message: data.message });
            }
            setConfig(data.data);
            Prompt({
              type: "information",
              message: "Updates have been saved.",
            });
          })
          .catch((err) => Prompt({ type: "error", data: err.message }));
      })}
    >
      <div>
        <div className="flex justify-space-between align-center mb-1">
          <h5>Reports</h5>
          <button
            className="btn"
            type="button"
            onClick={() => setAddReport(true)}
          >
            Create Report Template
          </button>
        </div>
        <Table
          columns={[
            { label: "Section Title" },
            { label: "Elements" },
            { label: "Actions" },
          ]}
        >
          {footerElements?.map((section, i) => (
            <tr key={section.title}>
              <td>{section.title}</td>
              <td>{section.items?.length}</td>
              <TableActions
                actions={[
                  {
                    icon: <FaPencilAlt />,
                    label: "Edit",
                    callBack: () => {
                      setEditSection(section);
                      setAddReport(true);
                    },
                  },
                  {
                    icon: <FaRegTrashAlt />,
                    label: "Delete",
                    callBack: () =>
                      Prompt({
                        type: "confirmation",
                        message: `Are you sure you want to remove this section?`,
                        callback: () => {
                          setValue(
                            "footerElements",
                            footerElements.filter((i) => i._id !== section._id)
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

      <Modal
        open={addReport}
        head
        label={`${editSection ? "Update" : "Create"} Record Template`}
        className={s.recFilterModal}
        setOpen={() => {
          setAddReport(false);
          setEditSection(null);
        }}
      >
        <FooterElements
          edit={editSection}
          onSuccess={(value) => {
            setValue(
              "footerElements",
              editSection
                ? footerElements.map((item) =>
                    item._id === value._id ? value : item
                  )
                : [...footerElements, value]
            );
            setAddReport(false);
            setEditSection(null);
          }}
        />
      </Modal>

      <div className="flex gap-1 justify-center">
        <button className="btn" disabled={loading}>
          Save Changes
        </button>
      </div>
    </form>
  );
};

const FooterElements = ({ edit, onSuccess }) => {
  const [updateItems, setUpdateItems] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [err, setErr] = useState(null);
  const {
    handleSubmit,
    register,
    control,
    watch,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: useYup(
      yup.object({
        title: yup.string().required("Section Title is required"),
        viewStyle: yup.string().required("Select a view style"),
      })
    ),
  });

  const items = watch("items");
  useEffect(() => {
    reset({
      title: edit?.title || "",
      viewStyle: edit?.viewStyle || "list",
      items: edit?.items || [],
    });
  }, [edit]);

  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (items.length <= 0) {
          return setErr("Add at least one item");
        }
        onSuccess({
          ...values,
          _id: edit?._id || Math.random().toString(36).substr(-8),
        });
      })}
      className={`p-1 grid gap-1`}
    >
      {err && <p className="error">{err}</p>}
      <Input
        {...register("title")}
        label="Section Title"
        error={errors.title}
      />

      <div>
        <div className="flex justify-space-between align-center mb-1">
          <h5>Items</h5>
          <button
            className="btn"
            type="button"
            onClick={() => setUpdateItems(true)}
          >
            Add Column
          </button>
        </div>
        <Table
          columns={[{ label: "Field" }, { label: "URL" }, { label: "Actions" }]}
        >
          {items?.map((item, i) => (
            <tr key={item.label}>
              <td>{item.label}</td>
              <td>{item.href}</td>
              <TableActions
                actions={[
                  {
                    icon: <FaPencilAlt />,
                    label: "Edit",
                    callBack: () => {
                      setEditItem(item);
                      setUpdateItems(true);
                    },
                  },
                  {
                    icon: <FaRegTrashAlt />,
                    label: "Delete",
                    callBack: () =>
                      Prompt({
                        type: "confirmation",
                        message: `Are you sure you want to remove this item?`,
                        callback: () => {
                          setValue(
                            "items",
                            items.filter((i) => i._id !== item._id)
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

      <Modal
        open={updateItems}
        head
        label={`${editItem ? "Update" : "Add"} Column`}
        className={s.recFilterModal}
        setOpen={() => {
          setUpdateItems(false);
          setEditItem(null);
        }}
      >
        <FooterElementForm
          edit={editItem}
          onSuccess={(value) => {
            setValue(
              "items",
              editItem
                ? items.map((item) => (item._id === value._id ? value : item))
                : [...items, value]
            );
            setUpdateItems(false);
            setEditItem(null);
            setErr(null);
          }}
        />
      </Modal>

      <div className="flex justify-center">
        <button className="btn">
          {edit ? "Update Section" : "Add Section"}
        </button>
      </div>
    </form>
  );
};

const FooterElementForm = ({ edit, onSuccess }) => {
  const {
    handleSubmit,
    control,
    register,
    reset,
    formState: { errors },
  } = useForm({
    resolver: useYup(
      yup.object({
        label: yup.string().required("Label is required"),
        href: yup
          .string()
          .matches(
            /^\/[a-zA-Z0-9\-._~!$&'()*+,;=:@]+$/,
            "Invalid sub-path format"
          )
          .required("Field is required"),
      })
    ),
  });

  useEffect(() => {
    reset({
      label: edit?.label || "",
      href: edit?.href || "",
      type: edit?.type || "dynamicPage",
      files: edit?.files || [],
    });
  }, [edit]);

  return (
    <form
      onSubmit={handleSubmit((values) => {
        onSuccess({
          ...values,
          _id: edit?._id || Math.random().toString(36).substr(-8),
        });
      })}
      className={`p-1 grid gap-1`}
    >
      <Input {...register("label")} label="Label" error={errors.label} />
      <Combobox
        label="URL Type"
        name="type"
        control={control}
        options={[
          { label: "Dynamic", value: "dynamicPage" },
          { label: "Internal Link", value: "internalLink" },
          { label: "External Link", value: "externalLink" },
        ]}
      />
      <Input
        {...register("href")}
        label="Path"
        placeholder="/some-path"
        error={errors.href}
      />

      <div className="flex justify-center">
        <button className="btn">
          {edit ? "Update Element" : "Add Element"}
        </button>
      </div>
    </form>
  );
};

export default SiteConfig;
