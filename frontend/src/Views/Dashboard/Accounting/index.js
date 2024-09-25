import { useState, useEffect, useMemo, useRef } from "react";
import { Table, Moment, Tabs } from "Components/elements";
import { Prompt, Modal } from "Components/modal";
import s from "./quotes.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import MasterForm from "./MasterForm";
import {
  BsDashSquare,
  BsFillPlusSquareFill,
  BsList,
  BsPlusSquare,
} from "react-icons/bs";
import { FiEdit3 } from "react-icons/fi";
import { PiTreeViewBold } from "react-icons/pi";
import { CgSpinner } from "react-icons/cg";
import { da } from "date-fns/locale";

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

const AccountNode = ({ account, setAddMaster, onClick = () => {} }) => {
  const [children, setChildren] = useState([]);
  const [open, setOpen] = useState(false);
  const { get: getMasters, loading } = useFetch(endpoints.accountingMasters);

  useEffect(() => {
    if (account.children) {
      if (account.children.length === account.totalChildren) {
        setChildren(account.children);
        setOpen(account?.isGroup ? account.children.length > 0 : false);
      } else if (
        account.children.length &&
        account.totalChildren > account.children.length
      ) {
        getMasters({ query: { parent: account._id } })
          .then(({ data }) => {
            if (data.success) {
              setChildren(data.data);
              setOpen(true);
            } else {
              Prompt({ type: "error", message: data.message });
            }
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      }
    }
  }, [account.children]);
  return (
    <li style={{ whiteSpace: "nowrap" }} className={s.listItem}>
      <div className={s.label}>
        {account.isGroup && (
          <>
            {(children?.length || account.totalChildren) > 0 ? (
              <button
                onClick={() => {
                  if (children?.length === account.totalChildren) {
                    setOpen(!open);
                  } else {
                    getMasters({ query: { parent: account._id } })
                      .then(({ data }) => {
                        if (data.success) {
                          setChildren(data.data);
                          setOpen(true);
                        } else {
                          Prompt({ type: "error", message: data.message });
                        }
                      })
                      .catch((err) =>
                        Prompt({ type: "error", message: err.message })
                      );
                  }
                }}
              >
                {loading ? (
                  <CgSpinner className="spin" />
                ) : open ? (
                  <BsDashSquare />
                ) : (
                  <BsPlusSquare />
                )}
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
              />
            )}
          </>
        )}
        <strong
          className={!account.isGroup ? s.accountName : ""}
          onClick={() => {
            if (!account.isGroup) {
              onClick(account);
            }
          }}
        >
          {account.name}
        </strong>
        <div className={s.btns}>
          <button className={s.addButton} onClick={() => setAddMaster(account)}>
            <FiEdit3 />
          </button>
          {account.isGroup && (
            <button
              className={s.addButton}
              onClick={() =>
                setAddMaster({ parent: account._id, type: account.type || "" })
              }
            >
              <BsFillPlusSquareFill />
            </button>
          )}
        </div>
      </div>
      {open && children.length > 0 && (
        <ul className={s.nestedList}>
          {children.map((child) => (
            <AccountNode
              key={child._id}
              account={child}
              setAddMaster={setAddMaster}
              onClick={onClick}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const Accounting = ({ setSidebarOpen }) => {
  const voucherTableRef = useRef();
  const [addMaster, setAddMaster] = useState(null);
  const [masters, setMasters] = useState([]);
  const [tab, setTab] = useState("voucherListing");
  const [open, setOpen] = useState(true);
  const [analysysAcc, setAnalysysAcc] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [filters, setFilters] = useState({});

  const { get: getMasters } = useFetch(endpoints.accountingMasters);
  const { get: getVouchers } = useFetch(endpoints.accountingVouchers);

  const treeData = useMemo(() => buildTree(masters), [masters]);

  useEffect(() => {
    getMasters({ query: { isGroup: "true" } })
      .then(({ data }) => {
        if (data.success) {
          return setMasters(data.data);
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);

  useEffect(() => {
    getVouchers({ query: filters })
      .then(({ data }) => {
        if (data.success) {
          setVouchers(data.data);
        } else {
          Prompt({ type: "error", message: data.message });
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, [filters]);
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

      <div className={`${s.innerWrapper} ${open ? s.open : ""}`}>
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
                  onClick={(account) => {
                    const firstRecords = (vouchers || []).filter(
                      (item) => item.accountId === account._id
                    );
                    const otherRecords = (vouchers || []).filter((item) =>
                      firstRecords.some((rec) => rec.rec_id === item.rec_id)
                    );
                    setAnalysysAcc(
                      [...firstRecords, ...otherRecords]
                        .filter(
                          (obj, index, self) =>
                            index ===
                            self.findIndex(
                              (o) =>
                                o.rec_id === obj.rec_id && o.index === obj.index
                            )
                        )
                        .sort((a, b) => (new Date(a) > new Date(b) ? 1 : -1))
                        .sort((a, b) => (a.index > b.index ? 1 : -1))
                    );
                    setTab("analysys");

                    // setFilters((prev) => ({
                    //   ...prev,
                    //   accountId: account._id,
                    // }));
                  }}
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
        <div className={s.innerContent}>
          <div className="flex gap-1 align-center">
            <button
              className="btn clear iconOnly"
              onClick={() => setOpen(!open)}
            >
              <PiTreeViewBold />
            </button>
            <Tabs
              activeTab={tab}
              tabs={[
                { label: "Voucher Listing", value: "voucherListing" },
                { label: "Accounting Analysys", value: "analysys" },
                // { label: "More Reports", value: "moreReports" },
              ]}
              onChange={(tab) => setTab(tab.value)}
            />
          </div>
          {tab === "voucherListing" && (
            <div className={s.innerContentWrapper}>
              <Table
                ref={voucherTableRef}
                url={endpoints.accountingVouchers}
                countRecord={(data = []) =>
                  data.reduce(
                    (p, c, i, arr) =>
                      p + (arr[i - 1]?.rec_id !== c.rec_id ? 1 : 0),
                    0
                  )
                }
                filters={filters}
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
                tfoot={(data) => (
                  <tfoot>
                    <tr className={s.footer}>
                      <td />
                      <td />
                      <td />
                      <td className="text-right">Total</td>
                      <td className="text-right">
                        {data.reduce((p, c) => p + c.debit, 0).toFixed(2)}
                      </td>
                      <td className="text-right">
                        {data.reduce((p, c) => p + c.credit, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              >
                {vouchers.map((row, i, arr) => (
                  <tr
                    key={i}
                    // onClick={() => {
                    //   setAnalysysAcc(() =>
                    //     voucherTableRef.current?.data.filter(
                    //       (item) => item.rec_id === row.rec_id
                    //     )
                    //   );
                    //   setTab("analysys");
                    // }}
                  >
                    <td className="grid">
                      {arr[i - 1]?.rec_id !== row.rec_id && (
                        <>
                          <Moment
                            style={{ fontSize: "14px" }}
                            format="DD MMM YYYY"
                          >
                            {row.createdAt}
                          </Moment>
                          <Moment format="hh:mma">{row.createdAt}</Moment>
                        </>
                      )}
                    </td>
                    <td>{arr[i - 1]?.rec_id !== row.rec_id && row.no}</td>
                    <td>{arr[i - 1]?.rec_id !== row.rec_id && row.type}</td>
                    <td>{row.accountName}</td>
                    <td className="text-right">
                      {row.debit ? row.debit.toFixed(2) : null}
                    </td>
                    <td className="text-right">
                      {row.credit ? row.credit.toFixed(2) : null}
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          )}
          {tab === "analysys" && <Analysys accounts={analysysAcc} />}
        </div>
      </div>

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
          onSuccess={() => {
            getMasters({ query: { isGroup: "true" } })
              .then(({ data }) => {
                if (data.success) {
                  return setMasters(data.data);
                }
              })
              .catch((err) => Prompt({ type: "error", message: err.message }));
            setAddMaster(false);
          }}
        />
      </Modal>
    </div>
  );
};

const Analysys = ({ accounts }) => {
  return (
    <div className={s.innerContentWrapper}>
      {accounts?.length > 0 ? (
        <>
          <p
            style={{ fontWeight: "600", fontSize: "1.2em" }}
            className="mt-1 pl_5"
          >
            {accounts[0].accountName}
          </p>
          <Table
            className={s.vouchers}
            columns={[
              { label: "Date" },
              { label: "No" },
              { label: "Type" },
              { label: "Account Name" },
              { label: "Debit", className: "text-right" },
              { label: "Credit", className: "text-right" },
            ]}
            tfoot={
              <tfoot>
                <tr className={s.footer}>
                  <td />
                  <td />
                  <td />
                  <td className="text-right">Total</td>
                  <td className="text-right">
                    {accounts.reduce((p, c) => p + c.debit, 0).toFixed(2)}
                  </td>
                  <td className="text-right">
                    {accounts.reduce((p, c) => p + c.credit, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            }
          >
            {accounts.map((row, i, arr) => {
              // if (i === 0) return null;
              return (
                <tr key={i}>
                  <td className="grid">
                    {arr[i - 1]?.rec_id !== row.rec_id && (
                      <>
                        <Moment
                          style={{ fontSize: "14px" }}
                          format="DD MMM YYYY"
                        >
                          {row.createdAt}
                        </Moment>
                        <Moment format="hh:mma">{row.createdAt}</Moment>
                      </>
                    )}
                  </td>
                  <td>{arr[i - 1]?.rec_id !== row.rec_id && row.no}</td>
                  <td>{arr[i - 1]?.rec_id !== row.rec_id && row.type}</td>
                  <td>{row.accountName}</td>
                  <td className="text-right">
                    {row.debit ? row.debit.toFixed(2) : null}
                  </td>
                  <td className="text-right">
                    {row.credit ? row.credit.toFixed(2) : null}
                  </td>
                </tr>
              );
            })}
          </Table>
        </>
      ) : (
        <p className={s.analysysPlaceholder}>No account has been selected.</p>
      )}
    </div>
  );
};

export default Accounting;
