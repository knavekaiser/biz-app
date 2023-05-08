import { Suspense, lazy, useContext, useEffect } from "react";
import { SiteContext } from "SiteContext";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Tabs } from "Components/elements";
import { paths } from "config";
import { Header, Footer } from "Components/ui";

import s from "./dashboard.module.scss";

// import Settings from "./Settings";
// import AdminSettings from "./AdminSettings";
// import Businesses from "./Businesses";
// import AdminBusinesses from "./AdminBusinesses";
// import Invoices from "./Sales";
// import Orders from "./Orders";
// import Quotes from "./Quotes";
// import Purchases from "./Purchases";
// import Receipts from "./Receipts";
// import Payments from "./Payments";
// import DynamicTables from "./DynamicTables";
// import AdminDynamicTables from "./AdminDynamicTables";
// import Roles from "./Roles";
// import Employees from "./Employees";
// import StoreListings from "./Stores";
// import SubCategories from "./SubCategories";
// import Categories from "./Categories";

const Settings = lazy(() => import("./Settings"));
const AdminSettings = lazy(() => import("./AdminSettings"));
const Businesses = lazy(() => import("./Businesses"));
const AdminBusinesses = lazy(() => import("./AdminBusinesses"));
const Invoices = lazy(() => import("./Sales"));
const Orders = lazy(() => import("./Orders"));
const Quotes = lazy(() => import("./Quotes"));
const Purchases = lazy(() => import("./Purchases"));
const Receipts = lazy(() => import("./Receipts"));
const Payments = lazy(() => import("./Payments"));
const DynamicTables = lazy(() => import("./DynamicTables"));
const AdminDynamicTables = lazy(() => import("./AdminDynamicTables"));
const Roles = lazy(() => import("./Roles"));
const Employees = lazy(() => import("./Employees"));
const StoreListings = lazy(() => import("./Stores"));
const SubCategories = lazy(() => import("./SubCategories"));

const Dashboard = () => {
  const { user, business, userType, checkPermission } = useContext(SiteContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate(paths.signIn);
    }
  }, []);

  if (userType === "admin" && !business) {
    return (
      <div className={s.container}>
        <Header />
        <div className={s.tabs}>
          <Tabs
            className={s.tab}
            tabs={[
              { label: "Businesses", path: paths.businesses },
              { label: "Stores", path: paths.storeListings },
              // { label: "Categories", path: paths.categories },
              { label: "Sub Categories", path: paths.subCategories },
              {
                label: "Manage Data",
                path: paths.dynamicTables.replace("/*", ""),
              },
              { label: "Settings", path: paths.settings.baseUrl },
            ]}
          />
        </div>
        <Routes>
          {/* <Route path={paths.stores} element={<Stores />} /> */}
          <Route
            path={paths.subCategories}
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <SubCategories />
              </Suspense>
            }
          />
          <Route
            path={paths.storeListings}
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <StoreListings />
              </Suspense>
            }
          />
          {/* <Route path={paths.categories} element={<Categories />} /> */}
          <Route
            path={paths.businesses}
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <AdminBusinesses />
              </Suspense>
            }
          />
          <Route
            path={paths.settings.baseUrl}
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <AdminSettings />
              </Suspense>
            }
          />
          <Route
            path={paths.dynamicTables}
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <AdminDynamicTables />
              </Suspense>
            }
          />
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
          <Route
            path={paths.businesses}
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <Businesses />
              </Suspense>
            }
          />
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
                    label: "Manage Data",
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
            ...(["business", "admin"].includes(userType)
              ? [{ label: "Settings", path: paths.settings.baseUrl }]
              : []),
            ...(["staff", "admin"].includes(userType)
              ? [{ label: "Businesses", path: paths.businesses }]
              : []),
          ]}
        />
      </div>
      <Routes>
        {checkPermission("quote_read") && (
          <Route
            path={paths.quotes}
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <Quotes />
              </Suspense>
            }
          />
        )}
        {checkPermission("order_read") && (
          <Route
            path={paths.orders}
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <Orders />
              </Suspense>
            }
          />
        )}
        {checkPermission("invoice_read") && (
          <Route
            path={paths.sales}
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <Invoices />
              </Suspense>
            }
          />
        )}
        {checkPermission("purchase_read") && (
          <Route
            path={paths.purchases}
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <Purchases />
              </Suspense>
            }
          />
        )}
        {checkPermission("reciept_read") && (
          <Route
            path={paths.receipts}
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <Receipts />
              </Suspense>
            }
          />
        )}
        {checkPermission("payment_read") && (
          <Route
            path={paths.payments}
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <Payments />
              </Suspense>
            }
          />
        )}
        {checkPermission("dynamic_table_read") && (
          <Route
            path={paths.dynamicTables}
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <DynamicTables />
              </Suspense>
            }
          />
        )}
        {checkPermission("role_read") && (
          <Route
            path={paths.roles}
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <Roles />
              </Suspense>
            }
          />
        )}
        {checkPermission("employee_read") && (
          <Route
            path={paths.employees}
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <Employees />
              </Suspense>
            }
          />
        )}
        {userType === "staff" && (
          <Route
            path={paths.businesses}
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <Businesses />
              </Suspense>
            }
          />
        )}
        {userType === "admin" && (
          <Route
            path={paths.businesses}
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <AdminBusinesses />
              </Suspense>
            }
          />
        )}
        {["business", "admin"].includes(userType) && (
          <Route
            path={paths.settings.baseUrl}
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <Settings />
              </Suspense>
            }
          />
        )}
      </Routes>
      <Footer />
    </div>
  );
};

export default Dashboard;
