import { Suspense, lazy, useContext, useEffect } from "react";
import { SiteContext } from "SiteContext";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Tabs } from "Components/elements";
import { paths } from "config";
import { Header, Footer } from "Components/ui";

import s from "./dashboard.module.scss";

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
const SubPlans = lazy(() => import("./SubPlans"));
const Chats = lazy(() => import("./Chats"));

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
              {
                label: "Micro Apps",
                url: "https://crm.infinai.in",
                target: "_blank",
              },
              { label: "Stores", path: paths.storeListings },
              { label: "Subscription Plans", path: paths.subPlans },
              // { label: "Categories", path: paths.categories },
              // { label: "Sub Categories", path: paths.subcategories },
              { label: "Chats", path: paths.chats },
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
          {/* <Route
            path={paths.subcategories}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <SubCategories />
              </Suspense>
            }
          /> */}
          <Route
            path={paths.subPlans}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <SubPlans />
              </Suspense>
            }
          />
          <Route
            path={paths.storeListings}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <StoreListings />
              </Suspense>
            }
          />
          {/* <Route path={paths.categories} element={<Categories />} /> */}
          <Route
            path={paths.businesses}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <AdminBusinesses />
              </Suspense>
            }
          />
          <Route
            path={paths.settings.baseUrl}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <AdminSettings />
              </Suspense>
            }
          />
          <Route
            path={paths.dynamicTables}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <AdminDynamicTables />
              </Suspense>
            }
          />
          <Route
            path={paths.chats}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <Chats />
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
              { label: "Micro Apps", path: paths.businesses },
              // { label: "Settings", path: paths.settings },
            ]}
          />
        </div>
        <Routes>
          <Route
            path={paths.businesses}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
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
            ...(checkPermission("chat_read")
              ? [{ label: "Chats", path: paths.chats }]
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
              <Suspense fallback={<LoadingSaklleton />}>
                <Quotes />
              </Suspense>
            }
          />
        )}
        {checkPermission("order_read") && (
          <Route
            path={paths.orders}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <Orders />
              </Suspense>
            }
          />
        )}
        {checkPermission("invoice_read") && (
          <Route
            path={paths.sales}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <Invoices />
              </Suspense>
            }
          />
        )}
        {checkPermission("purchase_read") && (
          <Route
            path={paths.purchases}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <Purchases />
              </Suspense>
            }
          />
        )}
        {checkPermission("reciept_read") && (
          <Route
            path={paths.receipts}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <Receipts />
              </Suspense>
            }
          />
        )}
        {checkPermission("payment_read") && (
          <Route
            path={paths.payments}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <Payments />
              </Suspense>
            }
          />
        )}
        {checkPermission("dynamic_table_read") && (
          <Route
            path={paths.dynamicTables}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <DynamicTables />
              </Suspense>
            }
          />
        )}
        {checkPermission("role_read") && (
          <Route
            path={paths.roles}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <Roles />
              </Suspense>
            }
          />
        )}
        {checkPermission("employee_read") && (
          <Route
            path={paths.employees}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <Employees />
              </Suspense>
            }
          />
        )}
        {checkPermission("chat_read") && (
          <Route
            path={paths.chats}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <Chats />
              </Suspense>
            }
          />
        )}
        {userType === "staff" && (
          <Route
            path={paths.businesses}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <Businesses />
              </Suspense>
            }
          />
        )}
        {userType === "admin" && (
          <Route
            path={paths.businesses}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <AdminBusinesses />
              </Suspense>
            }
          />
        )}
        {["business", "admin"].includes(userType) && (
          <Route
            path={paths.settings.baseUrl}
            element={
              <Suspense fallback={<SettingLoading />}>
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

const LoadingSaklleton = () => {
  return (
    <div className={s.loading}>
      <div className={`${s.header} flex align-center justify-space-between`}>
        <div className={`${s.title} skl-loading`} />
        <div className={`${s.btns} flex gap_5`}>
          <div className={`${s.btn} skl-loading`} />
          <div className={`${s.btn} skl-loading`} />
        </div>
      </div>
      <div className={s.content}>
        <div className={s.head}>
          {Array(3)
            .fill(null)
            .map((item, i) => (
              <div
                key={i}
                style={{
                  width: `${Math.floor(Math.random() * (75 - 25 + 1)) + 25}%`,
                }}
                className={`${s.col} skl-loading`}
              />
            ))}
          <div className={`${s.col} skl-loading`} />
        </div>
        <div className={s.body}>
          {Array(4)
            .fill(null)
            .map((item, i) => (
              <div key={i} className={s.row}>
                <div
                  style={{
                    width: `${Math.floor(Math.random() * (75 - 25 + 1)) + 25}%`,
                  }}
                  className={`${s.col} skl-loading`}
                />
                <div
                  style={{
                    width: `${Math.floor(Math.random() * (75 - 25 + 1)) + 25}%`,
                  }}
                  className={`${s.col} skl-loading`}
                />
                <div
                  style={{
                    width: `${Math.floor(Math.random() * (75 - 25 + 1)) + 25}%`,
                  }}
                  className={`${s.col} skl-loading`}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const SettingLoading = () => {
  return (
    <div className={s.settingsLoading}>
      <div className={`${s.tabs} flex wrap gap_5`}>
        {Array(5)
          .fill(null)
          .map((item, i) => (
            <div key={i} className={`${s.tab} skl-loading`} />
          ))}
      </div>
      <div className={`${s.title} skl-loading`} />
      <div className={`${s.sq} skl-loading`} />
      <div className={`${s.title} skl-loading`} />
      <div className={`${s.title} skl-loading`} />
      <div className={`${s.title} skl-loading`} />
    </div>
  );
};

export default Dashboard;
