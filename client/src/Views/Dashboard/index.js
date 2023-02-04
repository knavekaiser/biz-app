import { useContext, useEffect } from "react";
import { SiteContext } from "SiteContext";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Tabs } from "Components/elements";
import Settings from "./Settings";
import { paths, endpoints } from "config";
import { useFetch } from "hooks";

import { FaPowerOff } from "react-icons/fa";

import s from "./dashboard.module.scss";

import Businesses from "./Businesses";
import Sales from "./Sales";
import Orders from "./Orders";
import Quotes from "./Quotes";
import Purchases from "./Purchases";
import Receipts from "./Receipts";
import Payments from "./Payments";
import DynamicTables from "./DynamicTables";
import Roles from "./Roles";
import Employees from "./Employees";

const Dashboard = () => {
  const { user, setUser, setConfig, business, checkPermission } =
    useContext(SiteContext);
  const navigate = useNavigate();

  const { post: logout } = useFetch(
    localStorage.getItem("userType") === "staff"
      ? endpoints.staffLogout
      : endpoints.logout
  );

  useEffect(() => {
    if (!user) {
      navigate(
        localStorage.getItem("userType") === "staff"
          ? paths.staffSignIn
          : paths.signIn
      );
    }
  }, []);

  if (localStorage.getItem("userType") === "staff" && !business) {
    return (
      <div className={s.container}>
        <div className={s.header}>
          <div className={s.siteName}>
            {user.logo && <img className={s.logo} src={user.logo} />}
            <h2>{user.name}</h2>
          </div>
          <button
            className={`clear ${s.logoutBtn}`}
            title="Log out"
            onClick={() => {
              logout().then(({ data }) => {
                if (data.success) {
                  setUser(null);
                  setConfig(null);
                  sessionStorage.removeItem("access_token");
                }
              });
            }}
          >
            <FaPowerOff />
          </button>
        </div>
        <div className={s.tabs}>
          <Tabs
            className={s.tab}
            tabs={[
              { label: "Businesses", path: paths.businesses },
              // { label: "Settings", path: paths.settings },
            ]}
          />
        </div>
        <Routes>
          <Route path={paths.businesses} element={<Businesses />} />
        </Routes>
        <footer>
          © {new Date().getFullYear()} Comify Technologies, All Rights Reserved.
        </footer>
      </div>
    );
  }
  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.siteName}>
          {user.logo && <img className={s.logo} src={user.logo} />}
          {business?.business?.logo && (
            <img className={s.logo} src={business.business.logo} />
          )}
          <h2>{business?.business?.name || user.name}</h2>
        </div>
        <button
          className={`clear ${s.logoutBtn}`}
          title="Log out"
          onClick={() => {
            logout().then(({ data }) => {
              if (data.success) {
                setUser(null);
                setConfig(null);
                sessionStorage.removeItem("access_token");
              }
            });
          }}
        >
          <FaPowerOff />
        </button>
      </div>
      <div className={s.tabs}>
        <Tabs
          className={s.tab}
          tabs={[
            ...(checkPermission("qoute_read")
              ? [{ label: "Quotes", path: paths.quotes }]
              : []),
            ...(checkPermission("order_read")
              ? [{ label: "Orders", path: paths.orders }]
              : []),
            ...(checkPermission("invoice_read")
              ? [{ label: "Invoices", path: paths.sales }]
              : []),
            ...(checkPermission("purchase_read")
              ? [{ label: "Purchases", path: paths.purchases }]
              : []),
            ...(checkPermission("reciept_read")
              ? [{ label: "Receipts", path: paths.receipts }]
              : []),
            ...(checkPermission("payment_read")
              ? [{ label: "Payments", path: paths.payments }]
              : []),
            ...(checkPermission("dynamic_table_read")
              ? [
                  {
                    label: "Dynamic Tables",
                    path: paths.dynamicTables.replace("/*", ""),
                  },
                ]
              : []),
            ...(checkPermission("role_read")
              ? [{ label: "Roles", path: paths.roles }]
              : []),
            ...(checkPermission("employee_read")
              ? [{ label: "Staffs", path: paths.employees }]
              : []),
            ...(localStorage.getItem("userType") === "staff"
              ? [{ label: "Businesses", path: paths.businesses }]
              : []),
            ...(localStorage.getItem("userType") === "business"
              ? [{ label: "Settings", path: paths.settings.baseUrl }]
              : []),
          ]}
        />
      </div>
      <Routes>
        {checkPermission("qoute_read") && (
          <Route path={paths.quotes} element={<Quotes />} />
        )}
        {checkPermission("order_read") && (
          <Route path={paths.orders} element={<Orders />} />
        )}
        {checkPermission("invoice_read") && (
          <Route path={paths.sales} element={<Sales />} />
        )}
        {checkPermission("purchase_read") && (
          <Route path={paths.purchases} element={<Purchases />} />
        )}
        {checkPermission("reciept_read") && (
          <Route path={paths.receipts} element={<Receipts />} />
        )}
        {checkPermission("payment_read") && (
          <Route path={paths.payments} element={<Payments />} />
        )}
        {checkPermission("dynamic_table_read") && (
          <Route path={paths.dynamicTables} element={<DynamicTables />} />
        )}
        {checkPermission("role_read") && (
          <Route path={paths.roles} element={<Roles />} />
        )}
        {checkPermission("employee_read") && (
          <Route path={paths.employees} element={<Employees />} />
        )}
        {localStorage.getItem("userType") === "staff" && (
          <Route path={paths.businesses} element={<Businesses />} />
        )}
        {localStorage.getItem("userType") === "business" && (
          <Route path={paths.settings.baseUrl} element={<Settings />} />
        )}
      </Routes>
      <footer>
        © {new Date().getFullYear()} Comify Technologies, All Rights Reserved.
      </footer>
    </div>
  );
};

export default Dashboard;
