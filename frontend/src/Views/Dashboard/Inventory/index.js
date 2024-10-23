import { useState, useEffect, useMemo, useRef, useContext } from "react";
import { Table, Moment, Tabs, Combobox } from "Components/elements";
import { Prompt, Modal } from "Components/modal";
import s from "./quotes.module.scss";
import { useFetch } from "hooks";
import { endpoints } from "config";

import BranchForm from "./BranchForm";
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
import { useForm } from "react-hook-form";
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
  account,
  setAddMaster,
  activeGroup,
  activeLeaf,
  activeLeavs = [],
  onClick = () => {},
}) => {
  const [children, setChildren] = useState([]);
  const [open, setOpen] = useState(false);
  const { get: getMasters, loading } = useFetch(endpoints.inventoryMasters);

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
              onClick={() =>
                setAddMaster({
                  parent: account._id,
                  type: account.type || "",
                  isGroup: false,
                })
              }
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
  const [addMaster, setAddMaster] = useState(null);
  const [masters, setMasters] = useState([]);
  const [tab, setTab] = useState("voucherListing");
  const [addBranch, setAddBranch] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("accounts");
  const [open, setOpen] = useState(true);
  const [analysysAcc, setAnalysysAcc] = useState(null);
  const [ledger, setLedger] = useState({});
  const [vouchers, setVouchers] = useState([]);
  const [journalAcc, setJournalAcc] = useState([]);
  const { control, reset } = useForm();

  const { get: getMasters } = useFetch(endpoints.inventoryMasters);
  const { get: getBranches } = useFetch(endpoints.inventoryBranches);

  const [branches, setBranches] = useState([]);
  const [branch, setBranch] = useState(null);

  const treeData = useMemo(() => buildTree(masters), [masters]);

  useEffect(() => {
    getBranches()
      .then(({ data }) => {
        if (data.success) {
          setBranches(data.data);
          if (data.data.length) {
            reset({ branch: data.data[0]._id });
            setBranch(data.data[0]);
          }
        } else {
          Prompt({ type: "error", message: data.message });
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));

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
          <h2>Inventory</h2>
        </div>
      </div>

      <div className={`${s.innerWrapper} ${open ? s.open : ""}`}>
        <div className={s.sidebar}>
          <div>
            <Tabs
              activeTab={sidebarTab}
              tabs={[
                { label: "Products", value: "accounts" },
                { label: "Branches", value: "branches" },
              ]}
              onChange={(tab) => setSidebarTab(tab.value)}
            />
            <button
              className={s.addButton}
              onClick={() => {
                if (sidebarTab === "accounts") {
                  setAddMaster({});
                } else if (sidebarTab === "branches") {
                  setAddBranch(true);
                }
              }}
            >
              <BsFillPlusSquareFill />
            </button>
          </div>
          {sidebarTab === "accounts" && (
            <ul>
              {masters.length > 0 ? (
                treeData.map((account) => (
                  <AccountNode
                    key={account._id}
                    account={account}
                    setAddMaster={setAddMaster}
                    activeGroup={tab === "analysys" ? analysysAcc?._id : null}
                    activeLeaf={tab === "ledgers" ? ledger?.account?._id : null}
                    activeLeavs={
                      tab === "journals" ? journalAcc.map((acc) => acc._id) : []
                    }
                    onClick={(account) => {
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
                        const detailedRows = allRecords.filter(
                          (row) => row.accountId === account._id
                        );
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
                  No product have been added yet.
                </p>
              )}
            </ul>
          )}
          {sidebarTab === "branches" && (
            <Branches
              branches={branches}
              setBranches={setBranches}
              addBranch={addBranch}
              setAddBranch={setAddBranch}
            />
          )}
        </div>
        <div className={s.innerContent}>
          <div style={{ maxWidth: "15rem" }}>
            <Combobox
              label="Branch"
              control={control}
              name="branch"
              options={branches.map((b) => ({
                label: b.name,
                value: b._id,
                branch: b,
              }))}
              onChange={(opt) => {
                if (opt?.branch) {
                  setBranch(opt.branch);
                }
              }}
              className="mb-2"
            />
          </div>
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
                { label: "Listing", value: "voucherListing" },
                { label: "Stock Ledgers", value: "ledgers" },
                { label: "Inventory Analysys", value: "analysys" },
              ]}
              onChange={(tab) => setTab(tab.value)}
            />
          </div>
          {tab === "voucherListing" && (
            <Vouchers
              branch={branch}
              vouchers={vouchers}
              setVouchers={setVouchers}
            />
          )}
          {tab === "ledgers" && (
            <Ledgers account={ledger?.account} branch={branch} />
          )}
          {tab === "analysys" && (
            <Analysys branch={branch} account={analysysAcc} />
          )}
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
            setAddMaster({});
          }}
        />
      </Modal>
    </div>
  );
};

const Branches = ({ branches, setBranches, addBranch, setAddBranch }) => {
  return (
    <>
      <ul>
        {branches.map((branch) => (
          <li key={branch._id} className={s.listItem}>
            {
              <div className={s.label}>
                <strong>{branch.name}</strong>
                <div className={s.btns}>
                  <button
                    className={s.addButton}
                    onClick={() => setAddBranch(branch)}
                  >
                    <FiEdit3 />
                  </button>
                </div>
              </div>
            }
          </li>
        ))}
        {branches.length === 0 && (
          <p className="text-center m-2">No branch has been added yet.</p>
        )}
      </ul>
      <Modal
        open={addBranch}
        head
        label={`${addBranch?._id ? "Update" : "Add"} Branch`}
        className={s.masterFormModal}
        setOpen={() => {
          setAddBranch(null);
        }}
      >
        <BranchForm
          edit={addBranch}
          onSuccess={(newBranch) => {
            if (addBranch?._id) {
              setBranches((prev) =>
                prev.map((b) => (b._id === newBranch._id ? newBranch : b))
              );
            } else {
              setBranches((prev) => [...prev, newBranch]);
            }
            setAddBranch(false);
          }}
        />
      </Modal>
    </>
  );
};

const Vouchers = ({ branch, vouchers, setVouchers }) => {
  const { config } = useContext(SiteContext);
  const [filters, setFilters] = useState({});
  const voucherTableRef = useRef();

  const { get: getVouchers } = useFetch(endpoints.inventoryListing);

  useEffect(() => {
    const query = { ...filters };
    if (branch) {
      query.branch = branch._id;
    }
    getVouchers({ query })
      .then(({ data }) => {
        if (data.success) {
          setVouchers(data.data);
        } else {
          Prompt({ type: "error", message: data.message });
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, [filters, branch]);

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
          { label: "Product Name" },
          { label: "In", className: "text-right" },
          { label: "Out", className: "text-right" },
          // { label: "Action" },
        ]}
        tfoot={() => (
          <tfoot>
            <tr className={s.footer}>
              <td />
              <td />
              <td />
              <td style={{ fontWeight: "bold" }}>Total</td>
              <td className="text-right">
                {vouchers
                  .reduce((p, c) => p + c.inward, 0)
                  .fix(2, config?.numberSeparator)}
              </td>
              <td className="text-right">
                {vouchers
                  .reduce((p, c) => p + c.outward, 0)
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
              {row.inward ? row.inward.fix(2, config?.numberSeparator) : null}
            </td>
            <td className="text-right">
              {row.outward ? row.outward.fix(2, config?.numberSeparator) : null}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

const Ledgers = ({ account, branch }) => {
  const { config } = useContext(SiteContext);
  const [data, setData] = useState([]);
  const [openingStock, setOpeningStock] = useState(0);
  const [filters, setFilters] = useState({});
  const { get: getLedgers } = useFetch(endpoints.inventoryLedgers);

  useEffect(() => {
    if (account) {
      const query = { accountId: account._id };
      if (branch) {
        query.branch = branch._id;
      }
      if (filters.startDate && filters.endDate) {
        query.startDate = filters.startDate;
        query.endDate = filters.endDate;
      }
      getLedgers({ query })
        .then(({ data }) => {
          if (data.success) {
            setData(data.data);
            setOpeningStock(data.openingStock || 0);
          } else {
            Prompt({ type: "error", message: data.message });
          }
        })
        .catch((err) => Prompt({ type: "error", message: err.message }));
    } else {
      setData([]);
    }
  }, [account, filters, branch]);
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
            className={s.ledgers}
            columns={[
              { label: "Date" },
              { label: "No" },
              { label: "Type" },
              { label: "In", className: "text-right" },
              { label: "Out", className: "text-right" },
            ]}
            countRecord={() => data.length}
            tfoot={
              <tfoot style={{ marginTop: "0" }}>
                <tr className={s.footer}>
                  <td />
                  <td />
                  <td style={{ fontWeight: "bold" }}>Totals</td>
                  <td className="text-right">
                    {data
                      .reduce((p, c) => p + c.inward, 0)
                      .fix(2, config?.numberSeparator)}
                  </td>
                  <td className="text-right">
                    {data
                      .reduce((p, c) => p + c.outward, 0)
                      .fix(2, config?.numberSeparator)}
                  </td>
                </tr>
                <tr className={s.closing}>
                  <td />
                  <td />
                  <td style={{ fontWeight: "bold" }}>Closing Stock</td>
                  <td className="text-right">
                    {(
                      (openingStock || 0) +
                      data.reduce((p, c) => p + (c.inward - c.outward), 0)
                    ).fix(2, config?.numberSeparator)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            }
          >
            <tr>
              <td />
              <td />
              <td style={{ fontWeight: "bold" }}>Opening Stock</td>
              <td className="text-right">
                {(openingStock || 0).fix(2, config?.numberSeparator)}
              </td>
              <td />
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
                  <td className="text-right">
                    {row.inward
                      ? row.inward.fix(2, config?.numberSeparator)
                      : null}
                  </td>
                  <td className="text-right">
                    {row.outward
                      ? row.outward.fix(2, config?.numberSeparator)
                      : null}
                  </td>
                </tr>
              );
            })}
          </Table>
        </>
      ) : (
        <p className={s.analysysPlaceholder}>No product has been selected.</p>
      )}
    </div>
  );
};

const Analysys = ({ branch, account }) => {
  const { config } = useContext(SiteContext);
  const [months, setMonths] = useState([]);
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [openingStocks, setOpeningStocks] = useState({});
  const [calculation, setCalculation] = useState("statement");
  const { get, loading } = useFetch(endpoints.inventoryMonthlyAnalysys);
  useEffect(() => {
    if (account) {
      const query = { accountId: account._id };
      if (branch) {
        query.branch = branch._id;
      }
      if (filters.startDate && filters.endDate) {
        query.startDate = filters.startDate;
        query.endDate = filters.endDate;
      }
      get({ query })
        .then(({ data }) => {
          if (data.success) {
            setData(data.data);
            setMonths(data.months);
            setOpeningStocks(data.openingStocks);
          } else {
            Prompt({ type: "error", message: data.message });
          }
        })
        .catch((err) => Prompt({ type: "error", message: err.message }));
    } else {
      setData([]);
      setMonths([]);
    }
  }, [account, filters, branch]);
  return (
    <div className={s.innerContentWrapper}>
      {account ? (
        <div>
          <AnalysysFilters filter={filters} setFilters={setFilters} />
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
                Stock Statement
              </label>
              <label className="flex align-center gap_5">
                <input
                  name="calculation"
                  type="radio"
                  value="sum_in"
                  checked={calculation === "sum_in"}
                  onChange={(e) => setCalculation(e.target.value)}
                />
                Total In
              </label>
              <label className="flex align-center gap_5">
                <input
                  name="calculation"
                  type="radio"
                  value="sum_out"
                  checked={calculation === "sum_out"}
                  onChange={(e) => setCalculation(e.target.value)}
                />
                Total Out
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
            </div>
          </div>
          <Table
            loading={loading}
            className={s.analysys}
            columns={[
              { label: account.name },
              ...(calculation === "statement"
                ? [
                    { label: "Opening Stock", className: "text-right" },
                    { label: "Total In", className: "text-right" },
                    { label: "Total Out", className: "text-right" },
                    { label: "Closing Stock", className: "text-right" },
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
                        {Object.values(openingStocks)
                          .reduce((p, c) => p + c, 0)
                          .fix(2, config?.numberSeparator)}
                      </td>
                      <td className="text-right">
                        {data
                          .reduce(
                            (p, c) =>
                              p +
                              c.entries
                                .flat()
                                .reduce((p, c) => p + c.inward, 0),
                            0
                          )
                          .fix(2, config?.numberSeparator)}
                      </td>
                      <td className="text-right">
                        {data
                          .reduce(
                            (p, c) =>
                              p +
                              c.entries
                                .flat()
                                .reduce((p, c) => p + c.outward, 0),
                            0
                          )
                          .fix(2, config?.numberSeparator)}
                      </td>
                      <td className="text-right">
                        {(
                          Object.values(openingStocks || {}).reduce(
                            (p, c) => p + c,
                            0
                          ) +
                          data.reduce(
                            (p, c) =>
                              p +
                              c.entries
                                .flat()
                                .reduce(
                                  (p, c) => p + (c.inward - c.outward),
                                  0
                                ),
                            0
                          )
                        ).fix(2, config?.numberSeparator)}
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
              return (
                <tr key={i}>
                  <td className="grid">{row.name}</td>
                  {calculation === "statement" ? (
                    <>
                      <td className="text-right">
                        {(openingStocks[row._id] || 0).fix(
                          2,
                          config?.numberSeparator
                        )}
                      </td>
                      <td className="text-right">
                        {row.entries
                          .flat()
                          .reduce((p, c) => p + c.inward, 0)
                          .fix(2, config?.numberSeparator)}
                      </td>
                      <td className="text-right">
                        {row.entries
                          .flat()
                          .reduce((p, c) => p + c.outward, 0)
                          .fix(2, config?.numberSeparator)}
                      </td>
                      <td className="text-right">
                        {(
                          (openingStocks[row._id] || 0) +
                          row.entries
                            .flat()
                            .reduce(
                              (p, c) =>
                                p + ((c.inward || 0) - (c.outward || 0)),
                              0
                            )
                        ).fix(2, config?.numberSeparator)}
                      </td>
                    </>
                  ) : (
                    (months || []).map((month, i) => (
                      <td key={i} className="text-right">
                        {analyzeAccounts(
                          calculation,
                          row.entries[i],
                          openingStocks[row._id],
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
  if (calculation === "sum_in") {
    result = entries.reduce((p, c) => p + c.inward, 0);
  } else if (calculation === "sum_out") {
    result = entries.reduce((p, c) => p + c.outward, 0);
  } else if (calculation === "net") {
    result = entries.reduce((p, c) => p + (c.inward - c.outward), 0);
  } else if (calculation === "statement") {
    result =
      entries.reduce((p, c) => p + (c.inward - c.outward), 0) + openingBalance;
    // return;
  }
  return result.fix(2, locale);
};

export default Accounting;
