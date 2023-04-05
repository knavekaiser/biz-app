import { useContext, useEffect } from "react";
import { SiteContext } from "SiteContext";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Tabs } from "Components/elements";
import { paths } from "config";
import { Header, Footer } from "Components/ui";

import s from "./dashboard.module.scss";

import Settings from "./Settings";
import AdminSettings from "./AdminSettings";
import Businesses from "./Businesses";
import Invoices from "./Sales";
import Orders from "./Orders";
import Quotes from "./Quotes";
import Purchases from "./Purchases";
import Receipts from "./Receipts";
import Payments from "./Payments";
import DynamicTables from "./DynamicTables";
import AdminDynamicTables from "./AdminDynamicTables";
import Roles from "./Roles";
import Employees from "./Employees";
import Stores from "./Stores";
import StoreListings from "./Stores/Listings";
import SubCategories from "./SubCategories";
import Categories from "./Categories";

const Dashboard = () => {
  const { user, business, userType, checkPermission } = useContext(SiteContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate(paths.signIn);
    }
  }, []);

  if (userType === "admin") {
    return (
      <div className={s.container}>
        <Header />
        <div className={s.tabs}>
          <Tabs
            className={s.tab}
            tabs={[
              { label: "Stores", path: paths.stores },
              // { label: "Categories", path: paths.categories },
              { label: "Sub Categories", path: paths.subCategories },
              {
                label: "Dynamic Tables",
                path: paths.dynamicTables.replace("/*", ""),
              },
              { label: "Settings", path: paths.settings.baseUrl },
            ]}
          />
        </div>
        <Routes>
          <Route path={paths.stores} element={<Stores />} />
          <Route path={paths.subCategories} element={<SubCategories />} />
          <Route path={paths.storeListings} element={<StoreListings />} />
          {/* <Route path={paths.categories} element={<Categories />} /> */}
          <Route path={paths.settings.baseUrl} element={<AdminSettings />} />
          <Route path={paths.dynamicTables} element={<AdminDynamicTables />} />
        </Routes>
        <Footer />
      </div>
    );
  }
  if (localStorage.getItem("userType") === "staff" && !business) {
    return (
      <div className={s.container}>
        <Header />
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
        <Footer />
      </div>
    );
  }
  return (
    <div className={s.container}>
      <Header />
      <div className={s.tabs}>
        <Tabs
          className={s.tab}
          tabs={[
            ...(checkPermission("quote_read")
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
            ...(userType === "staff"
              ? [{ label: "Businesses", path: paths.businesses }]
              : []),
            ...(userType === "business"
              ? [{ label: "Settings", path: paths.settings.baseUrl }]
              : []),
          ]}
        />
      </div>
      <Routes>
        {checkPermission("quote_read") && (
          <Route path={paths.quotes} element={<Quotes />} />
        )}
        {checkPermission("order_read") && (
          <Route path={paths.orders} element={<Orders />} />
        )}
        {checkPermission("invoice_read") && (
          <Route path={paths.sales} element={<Invoices />} />
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
        {userType === "staff" && (
          <Route path={paths.businesses} element={<Businesses />} />
        )}
        {userType === "business" && (
          <Route path={paths.settings.baseUrl} element={<Settings />} />
        )}
      </Routes>
      <Footer />
    </div>
  );
};

export default Dashboard;
