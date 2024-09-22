import { useState, useEffect, useContext, useMemo } from "react";
import { SiteContext } from "SiteContext";
import { Table, TableActions, Moment, Tabs, Select } from "Components/elements";
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
import { FiEdit3 } from "react-icons/fi";
import VoucherFilters from "./Filters";

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
        <div className={s.btns}>
          <button className={s.addButton} onClick={() => setAddMaster(account)}>
            <FiEdit3 />
          </button>
          {account.isGroup && (
            <button
              className={s.addButton}
              onClick={() => setAddMaster({ parent: account._id })}
            >
              <BsFillPlusSquareFill />
            </button>
          )}
        </div>
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
  const [tab, setTab] = useState("voucherListing");
  const [filters, setFilters] = useState({});

  const { get: getMasters, loading } = useFetch(endpoints.accountingMasters);
  const { remove: deleteQuote } = useFetch(endpoints.quotes + "/{ID}");

  const treeData = useMemo(() => buildTree(masters), [masters]);

  useEffect(() => {
    getMasters()
      .then(({ data }) => {
        if (data.success) {
          return setMasters(data.data);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);
  console.log("list --->", filters);
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
        <div>
          <Tabs
            activeTab={tab}
            tabs={[
              { label: "Voucher Listing", value: "voucherListing" },
              // { label: "Reports", value: "reports" },
              // { label: "More Reports", value: "moreReports" },
            ]}
            onChange={(tab) => setTab(tab.value)}
          />
          {tab === "voucherListing" && (
            <div>
              <Table
                url={endpoints.accountingVouchers}
                // filters={filters}
                filterFields={[
                  {
                    label: "Type",
                    fieldType: "select",
                    name: "type",
                    optionType: "predefined",
                    options: [
                      { label: "Invoice", value: "Invoice" },
                      { label: "Purchase", value: "Purchase" },
                      { label: "Receipt", value: "Receipt" },
                      { label: "Payment", value: "Payment" },

                      // { label: "None", value: "null" },
                      // { label: "Cash", value: "Cash" },
                      // { label: "Bank", value: "Bank" },
                      // { label: "Customers", value: "Customers" },
                      // { label: "Suppliers", value: "Suppliers" },
                      // { label: "Sales", value: "Sales" },
                      // { label: "Purchase", value: "Purchase" },
                      // { label: "Stock", value: "Stock" },
                    ],
                  },
                  {
                    label: "Start Date",
                    fieldType: "input",
                    inputType: "datetime-local",
                    name: "startDate",
                  },
                  {
                    label: "End Date",
                    fieldType: "input",
                    inputType: "datetime-local",
                    name: "endDate",
                  },
                ]}
                className={s.vouchers}
                columns={[
                  { label: "Date" },
                  { label: "No" },
                  { label: "Type" },
                  { label: "Account Name" },
                  { label: "Debit", className: "text-right" },
                  { label: "Credit", className: "text-right" },
                  // { label: "Action" },
                ]}
                renderRow={(row, i) => (
                  <tr key={i}>
                    <td>
                      <Moment format="DD-MM-YYYY hh:mma">
                        {row.createdAt}
                      </Moment>
                    </td>
                    <td>{row.no}</td>
                    <td>{row.type}</td>
                    <td>{row.accountName}</td>
                    <td className="text-right">{row.debit || 0}</td>
                    <td className="text-right">{row.credit || 0}</td>
                  </tr>
                )}
                tfoot={(data) => (
                  <tfoot>
                    <tr>
                      <td />
                      <td />
                      <td />
                      <td className="text-right">Total</td>
                      <td className="text-right">
                        {data
                          .reduce((p, c) => p + c.debit, 0)
                          .toLocaleString("en-IN")}
                      </td>
                      <td className="text-right">
                        {data
                          .reduce((p, c) => p + c.credit, 0)
                          .toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tfoot>
                )}
              />
            </div>
          )}
        </div>
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
        label={`${addMaster?._id ? "Update" : "Add"} Account`}
        className={s.masterFormModal}
        setOpen={() => {
          setAddMaster(null);
        }}
      >
        <MasterForm
          edit={addMaster}
          masters={masters}
          onSuccess={(newMaster) => {
            if (addMaster?._id) {
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
