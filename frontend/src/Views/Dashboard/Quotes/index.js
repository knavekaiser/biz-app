import { useState, useEffect, useContext } from "react";
import { SiteContext } from "SiteContext";
import { Table, TableActions, Moment } from "Components/elements";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./quotes.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import QuoteForm from "./QuoteForm";
import { BsList } from "react-icons/bs";
import { GoPlus } from "react-icons/go";

const Quotes = ({ setSidebarOpen }) => {
  const { config, checkPermission } = useContext(SiteContext);
  const [quotes, setQuotes] = useState([]);
  const [quote, setQuote] = useState(null);
  const [addQuote, setAddQuote] = useState(false);

  const { get: getQuotes, loading } = useFetch(endpoints.quotes);
  const { remove: deleteQuote } = useFetch(endpoints.quotes + "/{ID}");

  useEffect(() => {
    getQuotes()
      .then(({ data }) => {
        if (data.success) {
          return setQuotes(data.data);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);
  return (
    <div className={`${s.content} grid gap-1 m-a`}>
      <div className={`flex ${s.head}`}>
        <div
          className={`flex align-center pointer gap_5  ml-1`}
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <BsList style={{ fontSize: "1.75rem" }} />
          <h2>All Quotes</h2>
          {checkPermission("quote_create") && (
            <button
              className="btn clear iconOnly"
              onClick={(e) => {
                e.stopPropagation();
                setAddQuote(true);
              }}
            >
              <GoPlus />
            </button>
          )}
        </div>
      </div>
      <Table
        loading={loading}
        className={s.quotes}
        columns={[
          { label: "Date" },
          { label: "Customer" },
          { label: "Status" },
          { label: "Net Amount", className: "text-right" },
          { label: "Action" },
        ]}
      >
        {quotes.map((item) => (
          <tr
            onClick={() => {
              setQuote(item);
              setAddQuote(true);
            }}
            style={{ cursor: "pointer" }}
            key={item._id}
          >
            <td className={s.date}>
              <Moment format="DD/MM/YYYY">{item.date}</Moment>
            </td>
            <td className={s.customer}>{item.customer?.name}</td>
            <td>{item.status}</td>
            <td className={`text-right ${s.net}`}>
              {item.items
                .reduce((p, c) => p + c.qty * c.price, 0)
                .fix(2, config?.numberSeparator)}
            </td>
            <TableActions
              className={s.actions}
              actions={[
                {
                  icon: <FaRegEye />,
                  label: "View",
                  onClick: () => {
                    setQuote(item);
                    setAddQuote(true);
                  },
                },
                ...(checkPermission("quote_delete")
                  ? [
                      {
                        icon: <FaRegTrashAlt />,
                        label: "Delete",
                        onClick: () =>
                          Prompt({
                            type: "confirmation",
                            message: `Are you sure you want to remove this quote?`,
                            callback: () => {
                              deleteQuote(
                                {},
                                { params: { "{ID}": item._id } }
                              ).then(({ data }) => {
                                if (data.success) {
                                  setQuotes((prev) =>
                                    prev.filter(
                                      (quote) => quote._id !== item._id
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
        open={addQuote}
        head
        label={`${quote ? "View / Update" : "Add"} Quote`}
        className={s.addQuoteFormModal}
        setOpen={() => {
          setQuote(null);
          setAddQuote(false);
        }}
      >
        <QuoteForm
          edit={quote}
          quotes={quotes}
          onSuccess={(newQuote) => {
            if (quote) {
              setQuotes((prev) =>
                prev.map((item) =>
                  item._id === newQuote._id ? newQuote : item
                )
              );
              setQuote(null);
            } else {
              setQuotes((prev) => [...prev, newQuote]);
            }
            setAddQuote(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Quotes;
