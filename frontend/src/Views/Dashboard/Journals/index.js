import { useState, useEffect, useContext } from "react";
import { SiteContext } from "SiteContext";
import { Table, TableActions, Moment } from "Components/elements";
import { FaRegTrashAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./payments.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import JournalForm from "./PaymentForm";
import { BsList } from "react-icons/bs";
import { GoPlus } from "react-icons/go";
import { FaPencil } from "react-icons/fa6";

const Payments = ({ setSidebarOpen }) => {
  const { config, checkPermission } = useContext(SiteContext);
  const [journals, setJournals] = useState([]);
  const [entry, setEntry] = useState(null);
  const [addEntry, setAddEntry] = useState(false);

  const { get: getJournals, loading } = useFetch(endpoints.journals);
  const { remove: deleteEntry } = useFetch(endpoints.journals + "/{ID}");

  useEffect(() => {
    getJournals()
      .then(({ data }) => {
        if (data.success) {
          return setJournals(data.data);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);
  return (
    <div className={`${s.content} grid gap-1 m-a p-1`}>
      <div className={`flex ${s.head}`}>
        <div
          className={`flex align-center pointer gap_5  ml-1`}
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <BsList style={{ fontSize: "1.75rem" }} />
          <h2>Journals</h2>
          {checkPermission("journal_create") && (
            <button
              className="btn clear iconOnly"
              onClick={(e) => {
                e.stopPropagation();
                setAddEntry(true);
              }}
            >
              <GoPlus />
            </button>
          )}
        </div>
      </div>
      <Table
        loading={loading}
        className={s.payments}
        columns={[
          { label: "Date" },
          { label: "Account" },
          { label: "Debit", className: "text-right" },
          { label: "Credit", className: "text-right" },
          { label: "Action" },
        ]}
      >
        {journals.map((item) => (
          <tr
            onClick={() => {
              setEntry(item);
              setAddEntry(true);
            }}
            style={{ cursor: "pointer" }}
            key={item._id}
          >
            <td className={s.date}>
              <Moment format="DD/MM/YYYY">{item.updatedAt}</Moment>
            </td>
            <td className={s.customer}>{item.accountName}</td>
            <td className="text-right">
              {item.debit
                ? item.debit.toFixed(2, config?.numberSeparator)
                : null}
            </td>
            <td className={`text-right`}>
              {item.credit ? item.credit.fix(2, config?.numberSeparator) : null}
            </td>
            <TableActions
              className={s.actions}
              actions={[
                {
                  icon: <FaPencil />,
                  label: "Edit",
                  onClick: () => {
                    setEntry(item);
                    setAddEntry(true);
                  },
                },
                ...(checkPermission("journal_delete")
                  ? [
                      {
                        icon: <FaRegTrashAlt />,
                        label: "Delete",
                        onClick: () =>
                          Prompt({
                            type: "confirmation",
                            message: `Are you sure you want to remove this entry?`,
                            callback: () => {
                              deleteEntry(
                                {},
                                { params: { "{ID}": item._id } }
                              ).then(({ data }) => {
                                if (data.success) {
                                  setJournals((prev) =>
                                    prev.filter(
                                      (entry) => entry._id !== item._id
                                    )
                                  );
                                } else {
                                  Prompt({
                                    type: "error",
                                    message: data.message,
                                  });
                                }
                              });
                            },
                          }),
                      },
                    ]
                  : []),
              ]}
            />
          </tr>
        ))}
      </Table>
      <Modal
        open={addEntry}
        head
        label={`${entry ? "Update" : "Add"} Journal Entries`}
        className={s.addPaymentFormModal}
        setOpen={() => {
          setEntry(null);
          setAddEntry(false);
        }}
      >
        <JournalForm
          edit={entry}
          payments={journals}
          onSuccess={(newEntry) => {
            if (entry) {
              setJournals((prev) =>
                prev.map((item) =>
                  item._id === newEntry._id ? newEntry : item
                )
              );
              setEntry(null);
            } else {
              setJournals((prev) => [...prev, ...newEntry]);
            }
            setAddEntry(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Payments;
