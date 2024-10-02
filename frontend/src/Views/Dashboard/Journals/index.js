import { useState, useEffect, useContext } from "react";
import { SiteContext } from "SiteContext";
import { Table, TableActions, Moment } from "Components/elements";
import { FaRegTrashAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./journals.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import JournalForm from "./JournalForm";
import { BsList } from "react-icons/bs";
import { GoPlus } from "react-icons/go";
import { FaPencil } from "react-icons/fa6";

const Journals = ({ setSidebarOpen }) => {
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
        className={s.journals}
        columns={[
          { label: "Date" },
          { label: "No" },
          { label: "Account" },
          { label: "Debit", className: "text-right" },
          { label: "Credit", className: "text-right" },
          { label: "Action" },
        ]}
      >
        {journals.map((item, i, arr) => (
          <tr
            // onClick={() => {
            //   setEntry(item);
            //   setAddEntry(true);
            // }}
            // style={{ cursor: "pointer" }}
            key={item._id}
          >
            <td className="grid">
              {arr[i - 1]?.rec_id !== item.rec_id && (
                <>
                  <Moment style={{ fontSize: "14px" }} format="DD MMM YYYY">
                    {item.dateTime}
                  </Moment>
                  <Moment format="hh:mma">{item.dateTime}</Moment>
                </>
              )}
            </td>
            <td>{arr[i - 1]?.rec_id !== item.rec_id && item.no}</td>
            <td className={s.customer}>{item.accountName}</td>
            <td className="text-right">
              {item.debit
                ? item.debit.toFixed(2, config?.numberSeparator)
                : null}
            </td>
            <td className={`text-right`}>
              {item.credit ? item.credit.fix(2, config?.numberSeparator) : null}
            </td>
            {arr[i - 1]?.rec_id !== item.rec_id && (
              <TableActions
                className={s.actions}
                actions={[
                  {
                    icon: <FaPencil />,
                    label: "Edit",
                    onClick: () => {
                      setEntry({
                        _id: item.rec_id,
                        dateTime: item.dateTime,
                        detail: item.detail,
                        entries: arr
                          .filter((i) => i.rec_id === item.rec_id)
                          .sort((a, b) => (a.index > b.index ? 1 : -1)),
                      });
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
                                  { params: { "{ID}": item.rec_id } }
                                ).then(({ data }) => {
                                  if (data.success) {
                                    setJournals((prev) =>
                                      prev.filter(
                                        (entry) => entry.rec_id !== item.rec_id
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
            )}
          </tr>
        ))}
      </Table>
      <Modal
        open={addEntry}
        head
        label={`${entry ? "Update" : "Add"} Journal Entries`}
        className={s.addFormModal}
        setOpen={() => {
          setEntry(null);
          setAddEntry(false);
        }}
      >
        <JournalForm
          edit={entry}
          onSuccess={(newEntries) => {
            setJournals((prev) =>
              [
                ...newEntries,
                ...prev.filter((item) => item.rec_id !== newEntries[0].rec_id),
              ].sort((a, b) =>
                new Date(a.dateTime) > new Date(b.dateTime) ? 1 : -1
              )
            );
            setEntry(null);
            setAddEntry(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Journals;
