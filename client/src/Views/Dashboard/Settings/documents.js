import { useEffect, useState, useRef } from "react";
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
        <h3>FAQ Documents</h3>
        <button type="button" className="btn" onClick={() => setAddDoc(true)}>
          Add Document
        </button>
      </div>
      <Table
        className={s.faqDocs}
        columns={[{ label: "Topic" }, { label: "Files" }, { label: "Action" }]}
      >
        {docs.map((item, i) => (
          <tr key={i}>
            <td>{item.topic}</td>
            <td>{item.files.length}</td>
            <TableActions
              actions={[
                {
                  icon: <FaPencilAlt />,
                  label: "Edit",
                  callBack: () => {
                    setEdit(item);
                    setAddDoc(true);
                  },
                },
                {
                  icon: <FaRegTrashAlt />,
                  label: "Delete",
                  callBack: () =>
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
        label={edit ? "Update Document" : "Add Document"}
        open={addDoc}
        setOpen={setAddDoc}
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
  files: yup
    .array()
    .of(yup.mixed())
    .min(1, "Please select at least one file")
    .required(),
});

const DocForm = ({ edit, onSuccess }) => {
  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: useYup(docSchema),
  });
  const formRef = useRef();

  const { post, put, loading } = useFetch(
    endpoints.faqDocuments + `/${edit?._id || ""}`
  );

  useEffect(() => {
    reset({ ...edit });
  }, [edit]);
  return (
    <form
      ref={formRef}
      className={s.termForm}
      onSubmit={handleSubmit((values) => {
        const payload = {
          ...values,
          files: values.files,
        };
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
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
      <FileInputNew
        label="File"
        accept="txt,pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
        control={control}
        name="files"
      />
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
