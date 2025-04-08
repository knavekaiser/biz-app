import { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useYup, useFetch } from "hooks";
import { Prompt, Modal } from "Components/modal";
import { endpoints } from "config";
import {
  Textarea,
  Table,
  TableActions,
  Input,
  FileInputNew,
} from "Components/elements";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import * as yup from "yup";
import s from "./settings.module.scss";
import { useNavigate } from "react-router-dom";
import { paths } from "config";

const FaqDocs = ({ next }) => {
  const [docs, setDocs] = useState([]);
  const navigate = useNavigate();

  const { get: getDocs, loading } = useFetch(endpoints.faqDocuments);

  useEffect(() => {
    getDocs()
      .then(({ data }) => {
        if (!data.success) {
          return Prompt({ type: "error", message: data.message });
        }
        setDocs(data.data);
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);

  return (
    <form className="grid gap-1">
      <Docs docs={docs} setDocs={setDocs} />
      <div className="flex gap-1 justify-center">
        {next && (
          <button
            className="btn"
            disabled={loading}
            onClick={() =>
              navigate(
                paths.dashboard.replace("*", "") +
                  paths.settings.baseUrl.replace("*", "") +
                  paths.settings.config,
                { state: { next: true } }
              )
            }
          >
            Next
          </button>
        )}
      </div>
    </form>
  );
};

const Docs = ({ docs, setDocs }) => {
  const [edit, setEdit] = useState(null);
  const [addDoc, setAddDoc] = useState(false);
  const { remove, loading } = useFetch(endpoints.faqDocuments + "/_id");
  return (
    <>
      <div className="flex justify-space-between align-center">
        <h3>AI Chat Knowledge Base</h3>
        <button type="button" className="btn" onClick={() => setAddDoc(true)}>
          Add New Topic
        </button>
      </div>
      <Table
        className={s.faqDocs}
        columns={[
          { label: "Topic" },
          { label: "Files" },
          { label: "URLs" },
          { label: "Token Count" },
          { label: "Action" },
        ]}
      >
        {docs.map((item, i) => (
          <tr key={i}>
            <td>{item.topic}</td>
            <td>{item.files.length}</td>
            <td>{item.urls.length}</td>
            <td>{item.tokenCount}</td>
            <TableActions
              actions={[
                {
                  icon: <FaPencilAlt />,
                  label: "Edit",
                  onClick: () => {
                    setEdit(item);
                    setAddDoc(true);
                  },
                },
                {
                  icon: <FaRegTrashAlt />,
                  label: "Delete",
                  onClick: () =>
                    Prompt({
                      type: "confirmation",
                      message: `Are you sure you want to remove this Document?`,
                      callback: () => {
                        remove(undefined, { params: { _id: item._id } })
                          .then(({ data }) => {
                            if (!data.success) {
                              return Prompt({
                                type: "error",
                                message: data.success,
                              });
                            }
                            setDocs((prev) =>
                              prev.filter((doc) => doc._id !== item._id)
                            );
                          })
                          .catch((err) =>
                            Prompt({ type: "error", message: err.message })
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
        label={edit ? "Update Topic" : "Add Topic"}
        open={addDoc}
        setOpen={() => {
          setAddDoc(false);
          setEdit(false);
        }}
        className={s.termFormModal}
      >
        <DocForm
          edit={edit}
          onSuccess={(newDoc) => {
            if (edit) {
              setDocs((prev) =>
                prev.map((t) => (t._id === edit._id ? newDoc : t))
              );
              setEdit(null);
            } else {
              setDocs((prev) => [...prev, newDoc]);
            }
            setAddDoc(false);
          }}
        />
      </Modal>
    </>
  );
};
const docSchema = yup.object({
  topic: yup.string().required(),
  description: yup.string(),
  files: yup.array().of(yup.mixed()),
  urls: yup.array().of(yup.string().url()),
});

const DocForm = ({ edit, onSuccess }) => {
  const [updateUrl, setUpdateUrl] = useState(false);
  const {
    handleSubmit,
    register,
    reset,
    control,
    watch,
    setError,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: useYup(docSchema),
  });
  const formRef = useRef();

  const { post, put, loading } = useFetch(
    endpoints.faqDocuments + `/${edit?._id || ""}`
  );

  const urls = watch("urls");
  const url = watch("url");

  useEffect(() => {
    reset({ ...edit, urls: edit?.urls || [] });
  }, [edit]);
  return (
    <form
      ref={formRef}
      className={s.termForm}
      onSubmit={handleSubmit((values) => {
        const payload = {
          ...values,
          files: values.files,
          urls: JSON.stringify(values.urls),
        };
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (key === "files" && value) {
            const oldFiles = value.filter((item) => item.url);
            const newFiles = value.filter((item) => !item.url);

            if (oldFiles.length) {
              formData.append(key, JSON.stringify(oldFiles));
            }
            if (newFiles.length) {
              newFiles.forEach((file) => formData.append(key, file));
            }
            return;
          }
          if (Array.isArray(value)) {
            value.forEach((file) => formData.append(key, file));
          } else if (value) {
            formData.append(key, value);
          }
        });

        (edit ? put : post)(formData)
          .then(({ data }) => {
            if (!data.success) {
              return Prompt({ type: "error", message: data.message });
            }
            onSuccess(data.data);
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
    >
      <Input label="Topic" {...register("topic")} error={errors.topic} />
      {/* <CustomRadio
        label="Source Type:"
        control={control}
        name="sourceType"
        options={[
          { label: "Files", value: "files" },
          { label: "URLs", value: "urls" },
        ]}
      /> */}
      <FileInputNew
        label="File"
        accept="txt,pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
        control={control}
        multiple
        name="files"
      />

      <section className={s.docUrls}>
        <section className={s.urlInput}>
          <Input
            label="URL"
            {...register("url")}
            error={errors.url}
            onChange={(e) => {
              setValue("url", e.target.value);
              clearErrors("url");
            }}
          />
          <button
            className="btn"
            type="button"
            onClick={() => {
              if (!url) {
                return setError("url", {
                  type: "manual",
                  message: "Field is required",
                });
              }

              const _url = url.startsWith("http") ? url : "http://" + url;
              setValue(
                "urls",
                updateUrl
                  ? urls.map((i) => (i === updateUrl ? _url : i))
                  : [...urls, _url]
              );
              setValue("url", "");
              setUpdateUrl(null);
            }}
          >
            {updateUrl ? "Update" : "Add"}
          </button>
          {updateUrl && (
            <button
              className="btn"
              type="button"
              onClick={() => {
                setValue("url", "");
                setUpdateUrl(null);
              }}
            >
              Cancel
            </button>
          )}
        </section>

        <Table columns={[{ label: "URL" }, { label: "Action" }]}>
          {(urls || []).map((item) => (
            <tr key={item}>
              <td>{item}</td>
              <TableActions
                actions={[
                  {
                    icon: <FaPencilAlt />,
                    label: "Edit",
                    onClick: () => {
                      setValue("url", item);
                      setUpdateUrl(item);
                    },
                  },
                  {
                    icon: <FaRegTrashAlt />,
                    label: "Delete",
                    onClick: () =>
                      Prompt({
                        type: "confirmation",
                        message: `Are you sure you want to remove this URL?`,
                        callback: () => {
                          setValue(
                            "urls",
                            urls.filter((i) => item !== i)
                          );
                        },
                      }),
                  },
                ]}
              />
            </tr>
          ))}
        </Table>
      </section>

      <Textarea
        label="Description"
        {...register("description")}
        error={errors.description}
      />
      <div className="btns">
        <button className="btn" disabled={loading}>
          Submit
        </button>
      </div>
    </form>
  );
};

export default FaqDocs;
