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

export default TermsAndConditions;
