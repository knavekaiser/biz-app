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

  const { get: getDocs, loading } = useFetch(endpoints.dynamicPages);

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
  const { remove, loading } = useFetch(endpoints.dynamicPages + "/_id");
  return (
    <>
      <div className="flex justify-space-between align-center">
        <h3>Blogs</h3>
        <button type="button" className="btn" onClick={() => setAddDoc(true)}>
          Add New Page
        </button>
      </div>
      <Table
        className={s.faqDocs}
        columns={[
          { label: "Title" },
          { label: "Description" },
          { label: "File" },
          { label: "Action" },
        ]}
      >
        {docs.map((item, i) => (
          <tr key={i}>
            <td>{item.title}</td>
            <td>{item.description}</td>
            <td>{item.file?.name || item.files?.[0]?.name}</td>
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
        label={edit ? "Update Page" : "Add Page"}
        open={addDoc}
        setOpen={() => {
          setAddDoc(false);
          setEdit(false);
        }}
        className={s.termFormModal}
      >
        <PageForm
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
const pageSchema = yup.object({
  title: yup.string().required(),
  description: yup.string(),
  path: yup
    .string()
    .test("is-valid-sub-path", "Invalid sub-path format", function (value) {
      if (value === undefined || value === "") return true; // Allow undefined values (optional)
      return /^\/[a-zA-Z0-9\-._~!$&'()*+,;=:@]+$/.test(value);
    }),
  // .required(),
  thumbnail: yup.mixed().required("Please provide an image."),
  files: yup.mixed().required("Please provide a file."),
});

const PageForm = ({ edit, onSuccess }) => {
  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: useYup(pageSchema),
  });
  const formRef = useRef();

  const { post, put, loading } = useFetch(
    endpoints.dynamicPages + `/${edit?._id || ""}`
  );

  useEffect(() => {
    reset({
      ...edit,
      thumbnail: edit?.thumbnail || null,
      files: edit?.files?.[0] || null,
    });
  }, [edit]);
  return (
    <form
      ref={formRef}
      className={s.termForm}
      onSubmit={handleSubmit((values) => {
        const payload = {
          ...values,
          path:
            values.path ||
            "/" +
              values.title
                .replaceAll(" ", "-")
                .replace(/[^a-zA-Z0-9\-._~!$&'()*+,;=:@\/]/g, ""),
        };
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (["thumbnail", "files"].includes(key)) {
            formData.append(
              key,
              (value?.url ? JSON.stringify(value) : value) || null
            );
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
      <Input label="Title" {...register("title")} error={errors.title} />

      <Input
        label="URL path"
        {...register("path")}
        error={errors.path}
        placeholder="/some-path"
      />

      <Textarea
        label="Description"
        {...register("description")}
        error={errors.description}
      />

      <FileInputNew
        label="Thumbnail"
        thumbnail
        accept="jpg,jpeg,png,webp"
        control={control}
        name="thumbnail"
      />

      <FileInputNew
        label="File"
        accept="txt,pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
        control={control}
        name="files"
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
