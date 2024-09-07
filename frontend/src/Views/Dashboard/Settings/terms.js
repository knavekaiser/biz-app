import { useContext, useEffect, useState, useRef } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import { useYup, useFetch } from "hooks";
import { Prompt, Modal } from "Components/modal";
import { endpoints } from "config";
import { Textarea, Table, TableActions } from "Components/elements";
import { FaPencilAlt, FaRegTrashAlt } from "react-icons/fa";
import * as yup from "yup";
import s from "./settings.module.scss";
import { useNavigate } from "react-router-dom";
import { paths } from "config";

const TermsAndConditions = ({ next }) => {
  const { user, setUser, business, setBusiness } = useContext(SiteContext);
  const [goNext, setGoNext] = useState(false);
  const navigate = useNavigate();
  const {
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [terms, setTerms] = useState([]);

  const { put: updateTerms, loading } = useFetch(
    business
      ? endpoints.businesses + `/${business.business._id}`
      : endpoints.companyProfile
  );

  useEffect(() => {
    const client = business?.business || user;
    setTerms(client.terms || []);
  }, [user, business]);

  return (
    <form
      className="grid gap-1"
      onSubmit={handleSubmit((values) => {
        updateTerms({ terms })
          .then(({ data }) => {
            if (!data.success) {
              return Prompt({ type: "error", message: data.message });
            }
            if (business) {
              setBusiness((prev) => ({
                ...prev,
                business: {
                  ...prev.business,
                  terms,
                },
              }));
            } else {
              setUser((prev) => ({
                ...prev,
                terms,
              }));
            }
            Prompt({
              type: "information",
              message: "Updates have been saved.",
              ...(goNext && {
                callback: () =>
                  navigate(
                    paths.dashboard.replace("*", "") +
                      paths.settings.baseUrl.replace("*", "") +
                      paths.settings.faqDocuments,
                    { state: { next: true } }
                  ),
              }),
            });
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
    >
      <Terms terms={terms} setTerms={setTerms} />

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
                  onClick: () => {
                    setEdit(item);
                    setAddTerm(true);
                  },
                },
                {
                  icon: <FaRegTrashAlt />,
                  label: "Delete",
                  onClick: () =>
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

export default TermsAndConditions;
