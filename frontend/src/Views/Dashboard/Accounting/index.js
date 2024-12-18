import { useState, useEffect, useMemo, useRef, useContext } from "react";
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
import { VoucherFilters, AnalysysFilters } from "./Filters";
import { SiteContext } from "SiteContext";

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

const AccountNode = ({
  masters,
  account,
  setAddMaster,
  activeGroup,
  activeLeaf,
  activeLeavs = [],
  defaultBalanceType,
  onClick = () => {},
}) => {
  const [children, setChildren] = useState([]);
  const [open, setOpen] = useState(false);
  const { get: getMasters, loading } = useFetch(endpoints.accountingMasters);

  useEffect(() => {
    if (account.children) {
      if (
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
      } else {
        setChildren(account.children);
        setOpen(account?.isGroup ? account.children.length > 0 : false);
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
          className={`${s.accountName} ${
            (account.isGroup && activeGroup === account._id) ||
            (!account.isGroup && activeLeaf === account._id) ||
            activeLeavs.includes(account._id)
              ? s.highlight
              : ""
          }`}
          onClick={() => {
            onClick(account);
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
              onClick={() => {
                setAddMaster({
                  parent: account._id,
                  type: account.type || "",
                  balanceType: defaultBalanceType,
                });
              }}
            >
              <BsFillPlusSquareFill />
            </button>
          )}
        </div>
      </div>
      {open && children.length > 0 && (
        <ul
          className={`${s.nestedList} ${
            account.isGroup && activeGroup === account._id ? s.highlight : ""
          }`}
        >
          {children.map((child) => (
            <AccountNode
              key={child._id}
              defaultBalanceType={defaultBalanceType}
              masters={masters}
              activeGroup={activeGroup}
              activeLeaf={activeLeaf}
              activeLeavs={activeLeavs}
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
  const { config } = useContext(SiteContext);
  const [addMaster, setAddMaster] = useState(null);
  const [masters, setMasters] = useState([]);
  const [tab, setTab] = useState("voucherListing");
  const [open, setOpen] = useState(true);
  const [analysysAcc, setAnalysysAcc] = useState(null);
  const [ledger, setLedger] = useState({});
  const [vouchers, setVouchers] = useState([]);
  const [journalAcc, setJournalAcc] = useState([]);

  const { get: getMasters } = useFetch(endpoints.accountingMasters);

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
                  defaultBalanceType={
                    account.name === "Assets" ? "debit" : "credit"
                  }
                  masters={masters}
                  key={account._id}
                  account={account}
                  setAddMaster={setAddMaster}
                  activeGroup={tab === "analysys" ? analysysAcc?._id : null}
                  activeLeaf={tab === "ledgers" ? ledger?.account?._id : null}
                  activeLeavs={
                    tab === "journals" ? journalAcc.map((acc) => acc._id) : []
                  }
                  onClick={(account) => {
                    if (tab === "journals") {
                      if (!account.isGroup) {
                        setJournalAcc((prev) =>
                          prev.some((acc) => acc._id === account._id)
                            ? prev.filter((acc) => acc._id !== account._id)
                            : [...prev, account].filter(
                                (acc, i, arr) =>
                                  arr.findIndex(
                                    (item) => item._id === acc._id
                                  ) === i
                              )
                        );
                      }
                      return;
                    }
                    if (account.isGroup) {
                      setAnalysysAcc(account);
                      setTab("analysys");
                    } else {
                      const firstRecords = (vouchers || []).filter(
                        (item) => item.accountId === account._id
                      );
                      const otherRecords = (vouchers || []).filter((item) =>
                        firstRecords.some((rec) => rec.rec_id === item.rec_id)
                      );
                      const allRecords = [
                        ...firstRecords,
                        ...otherRecords,
                      ].filter(
                        (obj, index, self) =>
                          index ===
                          self.findIndex(
                            (o) =>
                              o.rec_id === obj.rec_id && o.index === obj.index
                          )
                      );

                      const detailedRows = allRecords
                        .filter((row) => row.accountId !== account._id)
                        .reduce((p, c) => {
                          const index = p.findIndex((item) =>
                            item.some((row) => row.rec_id === c.rec_id)
                          );
                          if (index === -1) {
                            p.push([c]);
                          } else {
                            p[index].push(c);
                          }
                          return p;
                        }, [])
                        .map((item) => {
                          const accRec = allRecords.find(
                            (rec) => rec.rec_id === item[0].rec_id
                          );
                          if (item.length <= 1) {
                            return {
                              ...item[0],
                              debit: accRec.debit,
                              credit: accRec.credit,
                            };
                          } else {
                            return {
                              ...item[0],
                              details: item.map((row) => ({
                                label: row.accountName,
                                value: row.credit || row.debit,
                              })),
                              // credit: item.reduce((p, c) => p + c.credit, 0),
                              // debit: item.reduce((p, c) => p + c.debit, 0),
                              debit: accRec.debit,
                              credit: accRec.credit,
                            };
                          }
                        })
                        .sort((a, b) => (new Date(a) > new Date(b) ? 1 : -1))
                        .sort((a, b) => (a.index > b.index ? 1 : -1))
                        .reduce((p, c) => {
                          if (c.details?.length) {
                            p.push(
                              ...[
                                c,
                                ...c.details.map((item) => ({
                                  createdAt: null,
                                  no: null,
                                  type: null,
                                  accountName: (
                                    <p>
                                      {item.label}:{" "}
                                      {item.value.fix(
                                        2,
                                        config?.numberSeparator
                                      )}
                                    </p>
                                  ),
                                  debit: null,
                                  credit: null,
                                })),
                              ]
                            );
                          } else {
                            p.push(c);
                          }
                          return p;
                        }, []);
                      setLedger({
                        account,
                        rows: detailedRows,
                      });
                      setTab("ledgers");
                    }
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
                { label: "Ledgers", value: "ledgers" },
                { label: "Accounting Analysys", value: "analysys" },
                // { label: "Journals", value: "journals" },
              ]}
              onChange={(tab) => setTab(tab.value)}
            />
          </div>
          {tab === "voucherListing" && (
            <Vouchers vouchers={vouchers} setVouchers={setVouchers} />
          )}
          {tab === "ledgers" && (
            <Ledgers account={ledger?.account} rows={ledger?.rows} />
          )}
          {tab === "analysys" && <Analysys account={analysysAcc} />}
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

const Vouchers = ({ vouchers, setVouchers }) => {
  const { config } = useContext(SiteContext);
  const [filters, setFilters] = useState({});
  const voucherTableRef = useRef();

  const { get: getVouchers } = useFetch(endpoints.accountingVouchers);

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
    <div className={s.innerContentWrapper}>
      <VoucherFilters filters={filters} setFilters={setFilters} />
      <Table
        ref={voucherTableRef}
        countRecord={() =>
          vouchers.reduce(
            (p, c, i, arr) => p + (arr[i - 1]?.rec_id !== c.rec_id ? 1 : 0),
            0
          )
        }
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
        tfoot={() => (
          <tfoot>
            <tr className={s.footer}>
              <td />
              <td />
              <td />
              <td className="text-right">Total</td>
              <td className="text-right">
                {vouchers
                  .reduce((p, c) => p + c.debit, 0)
                  .fix(2, config?.numberSeparator)}
              </td>
              <td className="text-right">
                {vouchers
                  .reduce((p, c) => p + c.credit, 0)
                  .fix(2, config?.numberSeparator)}
              </td>
            </tr>
          </tfoot>
        )}
      >
        {vouchers.map((row, i, arr) => (
          <tr key={i}>
            <td className="grid">
              {arr[i - 1]?.rec_id !== row.rec_id && (
                <>
                  <Moment style={{ fontSize: "14px" }} format="DD MMM YYYY">
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
              {row.debit ? row.debit.fix(2, config?.numberSeparator) : null}
            </td>
            <td className="text-right">
              {row.credit ? row.credit.fix(2, config?.numberSeparator) : null}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

const Ledgers = ({ account, rows }) => {
  const { config } = useContext(SiteContext);
  const [data, setData] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [filters, setFilters] = useState({});
  const { get: getData } = useFetch(endpoints.accountingLedgers);

  const closingBalance =
    openingBalance +
    data.reduce((p, c) => p + c.debit, 0) -
    data.reduce((p, c) => p + c.credit, 0);
  useEffect(() => {
    if (account) {
      const query = { accountId: account._id };
      if (filters.startDate && filters.endDate) {
        query.startDate = filters.startDate;
        query.endDate = filters.endDate;
      }
      getData({ query })
        .then(({ data }) => {
          if (data.success) {
            setData(data.data);
            setOpeningBalance(data.openingBalance || 0);
          } else {
            Prompt({ type: "error", message: data.message });
          }
        })
        .catch((err) => Prompt({ type: "error", message: err.message }));
    } else {
      setData([]);
    }
  }, [account, filters]);
  return (
    <div className={s.innerContentWrapper}>
      {account ? (
        <>
          <AnalysysFilters filter={filters} setFilters={setFilters} />
          <p
            style={{ fontWeight: "600", fontSize: "1.2em" }}
            className="mt-1 pl_5"
          >
            {account.name}
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
              <tfoot style={{ marginTop: "0" }}>
                <tr className={s.footer}>
                  <td />
                  <td />
                  <td style={{ fontWeight: "bold" }}>Totals</td>
                  <td />
                  <td className="text-right">
                    {data
                      .reduce((p, c) => p + c.debit, 0)
                      .fix(2, config?.numberSeparator)}
                  </td>
                  <td className="text-right">
                    {data
                      .reduce((p, c) => p + c.credit, 0)
                      .fix(2, config?.numberSeparator)}
                  </td>
                </tr>
                <tr className={s.footer}>
                  <td />
                  <td />
                  <td style={{ fontWeight: "bold" }}>Closing Balance</td>
                  <td />
                  {closingBalance < 0 ? (
                    <>
                      <td />
                      <td className="text-right">
                        {Math.abs(closingBalance).fix(
                          2,
                          config?.numberSeparator
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="text-right">
                        {Math.abs(closingBalance).fix(
                          2,
                          config?.numberSeparator
                        )}
                      </td>
                      <td />
                    </>
                  )}
                </tr>
              </tfoot>
            }
          >
            <tr>
              <td />
              <td />
              <td style={{ fontWeight: "bold" }} className="grid">
                Opening Balance
              </td>
              <td />
              {openingBalance < 0 ? (
                <>
                  <td />
                  <td className="text-right">
                    {Math.abs(openingBalance || 0).fix(
                      2,
                      config?.numberSeparator
                    )}
                  </td>
                </>
              ) : (
                <>
                  <td className="text-right">
                    {Math.abs(openingBalance || 0).fix(
                      2,
                      config?.numberSeparator
                    )}
                  </td>
                  <td />
                </>
              )}
            </tr>
            {data.map((row, i, arr) => {
              return (
                <tr key={i}>
                  <td className="grid">
                    {row.createdAt && arr[i - 1]?.rec_id !== row.rec_id && (
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
                  <td className="grid">
                    {row.details?.length > 0 ? "Details:" : row.accountName}
                  </td>
                  <td className="text-right">
                    {row.debit
                      ? row.debit.fix(2, config?.numberSeparator)
                      : null}
                  </td>
                  <td className="text-right">
                    {row.credit
                      ? row.credit.fix(2, config?.numberSeparator)
                      : null}
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

const Analysys = ({ account }) => {
  const { config } = useContext(SiteContext);
  const [months, setMonths] = useState([]);
  const [filters, setFilters] = useState({});
  const [openingBalances, setOpeningBalances] = useState({});
  const [data, setData] = useState([]);
  const [calculation, setCalculation] = useState("sum_debit");

  const totalOpeningBalance = Object.values(openingBalances || {}).reduce(
    (p, c) => p + (c || 0),
    0
  );
  const totalClosingBalance = data.reduce(
    (p, row) =>
      p +
      ((openingBalances[row._id] || 0) +
        row.entries.flat().reduce((p, c) => p + c.debit, 0) -
        row.entries.flat().reduce((p, c) => p + c.credit, 0)),
    0
  );

  const { get, loading } = useFetch(endpoints.accountingMonthlyAnalysys);
  useEffect(() => {
    if (account) {
      const query = { accountId: account._id };
      if (filters.startDate && filters.endDate) {
        query.startDate = filters.startDate;
        query.endDate = filters.endDate;
      }
      get({ query })
        .then(({ data }) => {
          if (data.success) {
            setData(data.data);
            setMonths(data.months);
            setOpeningBalances(data.openingBalances);
          } else {
            Prompt({ type: "error", message: data.message });
          }
        })
        .catch((err) => Prompt({ type: "error", message: err.message }));
    } else {
      setData([]);
      setMonths([]);
    }
  }, [account, filters]);
  useEffect(() => {
    if (account) {
      setCalculation(
        ["Liabilities", "Income"].includes(account?.name)
          ? "sum_credit"
          : "sum_debit"
      );
    }
  }, [account]);
  return (
    <div className={s.innerContentWrapper}>
      {account ? (
        <div>
          <AnalysysFilters filters={filters} setFilters={setFilters} />
          <div className="mt-1 flex gap-2 align-center">
            <p
              style={{ fontWeight: "600", fontSize: "1.2em" }}
              className="pl_5"
            >
              {account.name}
            </p>
            <div className="flex gap-2">
              <label className="flex align-center gap_5">
                <input
                  name="calculation"
                  type="radio"
                  value="statement"
                  checked={calculation === "statement"}
                  onChange={(e) => setCalculation(e.target.value)}
                />
                Accounting Statement
              </label>
              <label className="flex align-center gap_5">
                <input
                  name="calculation"
                  type="radio"
                  value="sum_debit"
                  checked={calculation === "sum_debit"}
                  onChange={(e) => setCalculation(e.target.value)}
                />
                Sum Of Debits
              </label>
              <label className="flex align-center gap_5">
                <input
                  name="calculation"
                  type="radio"
                  value="sum_credit"
                  checked={calculation === "sum_credit"}
                  onChange={(e) => setCalculation(e.target.value)}
                />
                Sum Of Credit
              </label>
              <label className="flex align-center gap_5">
                <input
                  name="calculation"
                  type="radio"
                  value="net"
                  checked={calculation === "net"}
                  onChange={(e) => setCalculation(e.target.value)}
                />
                Net
              </label>
              <label className="flex align-center gap_5">
                <input
                  name="calculation"
                  type="radio"
                  value="balance"
                  checked={calculation === "balance"}
                  onChange={(e) => setCalculation(e.target.value)}
                />
                Balance
              </label>
            </div>
          </div>
          <Table
            loading={loading}
            className={s.analysys}
            columns={[
              { label: account.name },
              ...(calculation === "statement"
                ? [
                    { label: "Opening Balance", className: "text-right" },
                    { label: "Total Debit", className: "text-right" },
                    { label: "Total Credit", className: "text-right" },
                    { label: "Closing Balance", className: "text-right" },
                  ]
                : (months || []).map((item) => ({
                    label: item.label,
                    className: "text-right",
                  }))),
            ]}
            tfoot={
              <tfoot style={{ marginTop: "0" }}>
                <tr
                  className={s.footer}
                  style={{
                    borderTop: "1px solid #979797",
                    padding: "0 0.5rem",
                    paddingTop: "1rem",
                  }}
                >
                  <td>Total</td>
                  {calculation === "statement" ? (
                    <>
                      <td className="text-right">
                        {Math.abs(totalOpeningBalance).fix(
                          2,
                          config?.numberSeparator
                        )}{" "}
                        {totalOpeningBalance < 0 ? "Cr." : "Dr."}
                      </td>
                      <td className="text-right">
                        {data
                          .reduce(
                            (p, row) =>
                              p +
                              row.entries
                                .flat()
                                .reduce((p, c) => p + c.debit, 0),
                            0
                          )
                          .fix(2, config?.numberSeparator)}
                      </td>
                      <td className="text-right">
                        {data
                          .reduce(
                            (p, row) =>
                              p +
                              row.entries
                                .flat()
                                .reduce((p, c) => p + c.credit, 0),
                            0
                          )
                          .fix(2, config?.numberSeparator)}
                      </td>
                      <td className="text-right">
                        {Math.abs(totalClosingBalance).fix(
                          2,
                          config?.numberSeparator
                        )}{" "}
                        {totalClosingBalance < 0 ? "Cr." : "Dr."}
                      </td>
                    </>
                  ) : (
                    (months || []).map((month, i) => (
                      <td key={i} className="text-right">
                        {analyzeAccounts(
                          calculation,
                          data.reduce((prev, curr, j) => {
                            prev.push(...curr.entries[i]);
                            return prev;
                          }, []),
                          0,
                          config?.numberSeparator
                        )}
                      </td>
                    ))
                  )}
                </tr>
              </tfoot>
            }
          >
            {(data || []).map((row, i, arr) => {
              const closingBalance =
                (openingBalances[row._id] || 0) +
                row.entries.flat().reduce((p, c) => p + c.debit, 0) -
                row.entries.flat().reduce((p, c) => p + c.credit, 0);
              return (
                <tr key={i}>
                  <td className="grid">{row.name}</td>
                  {calculation === "statement" ? (
                    <>
                      <td className="text-right">
                        {Math.abs(openingBalances[row._id])?.fix(
                          2,
                          config?.numberSeparator
                        )}{" "}
                        {openingBalances[row._id] < 0 ? "Cr." : "Dr."}
                      </td>
                      <td className="text-right">
                        {row.entries
                          .flat()
                          .reduce((p, c) => p + c.debit, 0)
                          .fix(2, config?.numberSeparator)}
                      </td>
                      <td className="text-right">
                        {row.entries
                          .flat()
                          .reduce((p, c) => p + c.credit, 0)
                          .fix(2, config?.numberSeparator)}
                      </td>
                      <td className="text-right">
                        {Math.abs(closingBalance).fix(
                          2,
                          config?.numberSeparator
                        )}{" "}
                        {closingBalance < 0 ? "Cr." : "Dr."}
                      </td>
                    </>
                  ) : (
                    (months || []).map((month, i) => (
                      <td key={i} className="text-right">
                        {analyzeAccounts(
                          calculation,
                          row.entries[i],
                          row.openingBalance,
                          config?.numberSeparator
                        )}
                      </td>
                    ))
                  )}
                </tr>
              );
            })}
          </Table>
        </div>
      ) : (
        <p className={s.analysysPlaceholder}>No group has been selected.</p>
      )}
    </div>
  );
};

const analyzeAccounts = (calculation, entries, openingBalance = 0, locale) => {
  let result = null;
  if (calculation === "sum_debit") {
    result = entries.reduce((p, c) => p + c.debit, 0);
  } else if (calculation === "statement") {
    result = entries.reduce((p, c) => p + c.debit - c.credit, 0);
  } else if (calculation === "sum_credit") {
    result = entries.reduce((p, c) => p + c.credit, 0);
  } else if (calculation === "net") {
    result = entries.reduce((p, c) => p + c.debit - c.credit, 0);
  } else if (calculation === "balance") {
    result =
      entries.reduce((p, c) => p + c.debit - c.credit, 0) + openingBalance;
  }
  if (["net", "balance"].includes(calculation)) {
    return `${Math.abs(result).fix(2, locale)} ${result < 0 ? "Cr." : "Dr."}`;
  }
  return result.fix(2, locale);
};

export default Accounting;
