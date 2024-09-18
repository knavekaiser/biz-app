import { useState, useEffect, useContext, useMemo } from "react";
import { SiteContext } from "SiteContext";
import { Table, TableActions, Moment } from "Components/elements";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import { Prompt, Modal } from "Components/modal";
import s from "./quotes.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import MasterForm from "./MasterForm";
import QuoteForm from "./QuoteForm";
import {
  BsDashSquare,
  BsFillPlusSquareFill,
  BsList,
  BsPlusSquare,
} from "react-icons/bs";
import { GoPlus } from "react-icons/go";

const buildTree = (accounts) => {
  const accountMap = {};
  accounts.forEach((account) => {
    account.children = [];
    accountMap[account._id] = account;
  });

  const tree = [];

  accounts.forEach((account) => {
    if (account.parent) {
      const parent = accountMap[account.parent];
      if (parent) {
        parent.children.push(account);
      }
    } else {
      tree.push(account);
    }
  });

  return tree;
};

const AccountNode = ({ account, setAddMaster }) => {
  const [open, setOpen] = useState(false);
  return (
    <li style={{ whiteSpace: "nowrap" }} className={s.listItem}>
      <div className={s.label}>
        {account.isGroup && (
          <>
            {account.children?.length > 0 ? (
              <button onClick={() => setOpen(!open)}>
                {open ? <BsDashSquare /> : <BsPlusSquare />}
              </button>
            ) : (
              <button
                style={{
                  height: "16px",
                  width: "16px",
                  // background: "none",
                  border: "1px dashed #818181",
                  borderRadius: "2px",
                  pointerEvents: "none",
                }}
              ></button>
            )}
          </>
        )}
        <strong>{account.name}</strong>
        {account.isGroup && (
          <button
            className={s.addButton}
            onClick={() => setAddMaster({ parent: account._id })}
          >
            <BsFillPlusSquareFill />
          </button>
        )}
      </div>
      {open && account.children?.length > 0 && (
        <ul className={s.nestedList}>
          {account.children.map((child) => (
            <AccountNode
              key={child._id}
              account={child}
              setAddMaster={setAddMaster}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const Accounting = ({ setSidebarOpen }) => {
  const { config } = useContext(SiteContext);
  const [quotes, setQuotes] = useState([]);
  const [addMaster, setAddMaster] = useState(null);
  const [masters, setMasters] = useState([]);
  const [quote, setQuote] = useState(null);
  const [addQuote, setAddQuote] = useState(false);

  const { get: getMasters, loading } = useFetch(endpoints.accountingMasters);
  const { remove: deleteQuote } = useFetch(endpoints.quotes + "/{ID}");

  const treeData = useMemo(() => buildTree(masters), [masters]);

  useEffect(() => {
    // getMasters()
    //   .then(({ data }) => {
    //     if (data.success) {
    //       return setMasters(data.data);
    //     }
    //   })
    //   .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);
  return (
    <div className={`${s.content} grid gap-1 m-a`}>
      <div className={`flex ${s.head}`}>
        <div
          className={`flex align-center pointer gap_5  ml-1`}
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <BsList style={{ fontSize: "1.75rem" }} />
          <h2>Accounting</h2>
          {/* <button
            className="btn clear iconOnly"
            onClick={(e) => {
              e.stopPropagation();
              setAddQuote(true);
            }}
          >
            <GoPlus />
          </button> */}
        </div>
      </div>

      <div className={s.innerWrapper}>
        <div className={s.sidebar}>
          <button className={s.addButton} onClick={() => setAddMaster({})}>
            <BsFillPlusSquareFill />
          </button>
          <ul>
            {masters.length > 0 ? (
              treeData.map((account) => (
                <AccountNode
                  key={account._id}
                  account={account}
                  setAddMaster={setAddMaster}
                />
              ))
            ) : (
              <p
                style={{
                  marginTop: "1rem",
                  marginBottom: "1rem",
                  textAlign: "center",
                  textWrap: "balance",
                  color: "#797979",
                }}
              >
                No accounts have been added yet.
              </p>
            )}
          </ul>
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
                  {
                    icon: <FaRegTrashAlt />,
                    label: "Delete",
                    onClick: () =>
                      Prompt({
                        type: "confirmation",
                        message: `Are you sure you want to remove this record?`,
                        callback: () => {
                          deleteQuote(
                            {},
                            { params: { "{ID}": item._id } }
                          ).then(({ data }) => {
                            if (data.success) {
                              setMasters((prev) =>
                                prev.filter((quote) => quote._id !== item._id)
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
                ]}
              />
            </tr>
          ))}
        </Table>
      </div>

      <Modal
        open={addQuote}
        head
        label={`${quote ? "View / Update" : "Add"} Record`}
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
              setMasters((prev) =>
                prev.map((item) =>
                  item._id === newQuote._id ? newQuote : item
                )
              );
              setQuote(null);
            } else {
              setMasters((prev) => [...prev, newQuote]);
            }
            setAddQuote(false);
          }}
        />
      </Modal>

      <Modal
        open={addMaster}
        head
        label={`${quote ? "View / Update" : "Add"} Account`}
        className={s.masterFormModal}
        setOpen={() => {
          setAddMaster(null);
        }}
      >
        <MasterForm
          edit={addMaster}
          masters={masters}
          onSuccess={(newMaster) => {
            if (quote) {
              setMasters((prev) =>
                prev.map((item) =>
                  item._id === newMaster._id ? newMaster : item
                )
              );
            } else {
              setMasters((prev) => [...prev, newMaster]);
            }
            setAddMaster(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Accounting;
