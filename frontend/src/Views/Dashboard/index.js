import {
  Fragment,
  Suspense,
  lazy,
  useContext,
  useEffect,
  useState,
} from "react";
import { SiteContext } from "SiteContext";
import {
  Routes,
  Route,
  useNavigate,
  Link,
  useLocation,
} from "react-router-dom";
import { paths } from "config";
import { FaArrowLeftLong } from "react-icons/fa6";

import s from "./dashboard.module.scss";
import { FaRegUser } from "react-icons/fa";
import { Prompt } from "Components/modal";
import { useFetch } from "hooks";
import { endpoints } from "config";

import { RxExit } from "react-icons/rx";
import {
  MdBusinessCenter,
  MdOutlineBusinessCenter,
  MdOutlinePayments,
  MdPayments,
} from "react-icons/md";
import {
  PiTableFill,
  PiTableLight,
  PiUsersFour,
  PiUsersFourFill,
} from "react-icons/pi";
import {
  IoChatbubbles,
  IoChatbubblesOutline,
  IoHome,
  IoHomeOutline,
  IoPricetags,
  IoPricetagsOutline,
  IoReceipt,
  IoReceiptOutline,
  IoShieldCheckmark,
  IoShieldCheckmarkOutline,
  IoStorefront,
  IoStorefrontOutline,
} from "react-icons/io5";
import { BsGear, BsGearFill, BsList } from "react-icons/bs";
import {
  HiOutlineShoppingCart,
  HiOutlineUserGroup,
  HiShoppingCart,
  HiUserGroup,
} from "react-icons/hi";
import { PiInvoiceFill, PiInvoiceLight } from "react-icons/pi";
import {
  RiMoneyDollarBoxFill,
  RiMoneyDollarBoxLine,
  RiShoppingBag2Fill,
  RiShoppingBag2Line,
} from "react-icons/ri";
import { CgSpinner } from "react-icons/cg";

const Home = lazy(() => import("./Home"));
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
const SubPlans = lazy(() => import("./SubPlans"));
const Chats = lazy(() => import("./Chats"));

const Dashboard = () => {
  const { user, business, userType, checkPermission } = useContext(SiteContext);
  const [sidebarItems, setSidebarItems] = useState([
    {
      icon: <IoHomeOutline />,
      activeIcon: <IoHome className={s.filled} />,
      label: "Home",
      path: paths.dashboard.replace("/*", ""),
    },
    // {
    //   icon: <MdOutlineBusinessCenter style={{ fontSize: "1.2em" }} />,
    //   activeIcon: (
    //     <MdBusinessCenter style={{ fontSize: "1.2em" }} className={s.filled} />
    //   ),
    //   label: "Businesses",
    //   path: paths.businesses,
    // },
    // {
    //   icon: <PiUsersFour style={{ fontSize: "1.2em" }} />,
    //   activeIcon: (
    //     <PiUsersFourFill className={s.filled} style={{ fontSize: "1.2em" }} />
    //   ),
    //   label: "Micro Apps",
    //   path: "https://crm.infinai.in",
    //   target: "_blank",
    // },
    // {
    //   icon: <IoStorefrontOutline style={{ fontSize: "1.1em" }} />,
    //   activeIcon: (
    //     <IoStorefront className={s.filled} style={{ fontSize: "1.1em" }} />
    //   ),
    //   label: "Stores",
    //   path: paths.storeListings,
    // },
    // {
    //   icon: <MdOutlinePayments style={{ fontSize: "1.2em" }} />,
    //   activeIcon: (
    //     <MdPayments className={s.filled} style={{ fontSize: "1.2em" }} />
    //   ),
    //   label: "Subscription Plans",
    //   path: paths.subPlans,
    // },
    // {
    //   icon: <IoChatbubblesOutline style={{ fontSize: "1.2em" }} />,
    //   activeIcon: (
    //     <IoChatbubbles className={s.filled} style={{ fontSize: "1.2em" }} />
    //   ),
    //   label: "Chats",
    //   path: paths.chats,
    // },
    // {
    //   icon: <PiTableLight style={{ fontSize: "1.2em" }} />,
    //   activeIcon: (
    //     <PiTableFill className={s.filled} style={{ fontSize: "1.2em" }} />
    //   ),
    //   label: "Manage Data",
    //   path: paths.dynamicTables.replace("/*", ""),
    // },
    // {
    //   icon: <BsGear />,
    //   activeIcon: <BsGearFill className={s.filled} />,
    //   label: "Settings",
    //   path: paths.settings.baseUrl,
    // },
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1220);

  if (!user) {
    return (
      <div>
        <CgSpinner className="loadingSpinner" />
      </div>
    );
  }

  if (userType === "admin") {
    return (
      <div className={s.container}>
        <Sidebar
          sidebarOpen={sidebarOpen}
          sidebarItems={sidebarItems}
          setSidebarOpen={setSidebarOpen}
        />

        <div className={s.content}>
          <Routes>
            {/* <Route
              path={paths.subPlans}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <SubPlans setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
            <Route
              path={paths.storeListings}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <StoreListings setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
            <Route
              path={paths.businesses}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <AdminBusinesses setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
            <Route
              path={paths.settings.baseUrl}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <AdminSettings setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
            <Route
              path={paths.dynamicTables}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <AdminDynamicTables setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
            <Route
              path={paths.chats}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <Chats setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            /> */}
            <Route
              path={"*"}
              element={
                <div>
                  <div className={`flex p-1 align-center gap-1`}>
                    <div
                      className={`flex align-center pointer gap_5  ml-1`}
                      onClick={() => setSidebarOpen((prev) => !prev)}
                    >
                      <BsList style={{ fontSize: "1.75rem" }} />
                      <h2>Dashboard</h2>
                    </div>
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <h2>Please login as a company or staff.</h2>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    );
  }
  if (localStorage.getItem("userType") === "staff" && !business) {
    return (
      <div className={s.container}>
        <Sidebar
          sidebarOpen={sidebarOpen}
          sidebarItems={[
            {
              icon: <IoHomeOutline />,
              activeIcon: <IoHome className={s.filled} />,
              label: "Home",
              path: paths.dashboard.replace("/*", ""),
            },
            {
              icon: <MdOutlineBusinessCenter style={{ fontSize: "1.2em" }} />,
              activeIcon: (
                <MdBusinessCenter
                  style={{ fontSize: "1.2em" }}
                  className={s.filled}
                />
              ),
              label: "Businesses",
              path: paths.businesses,
            },
            {
              icon: <PiUsersFour style={{ fontSize: "1.2em" }} />,
              activeIcon: (
                <PiUsersFourFill
                  className={s.filled}
                  style={{ fontSize: "1.2em" }}
                />
              ),
              label: "Micro Apps",
              path: paths.businesses,
              target: "_blank",
            },
          ]}
          setSidebarOpen={setSidebarOpen}
        />

        <div className={s.content}>
          <Routes>
            <Route
              path={paths.businesses}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <Businesses />
                </Suspense>
              }
            />
            <Route
              path={"/"}
              element={
                <Suspense fallback={<SettingLoading />}>
                  <Home setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
          </Routes>
        </div>
      </div>
    );
  }
  return (
    <div className={s.container}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        sidebarItems={[
          {
            icon: <IoHomeOutline />,
            activeIcon: <IoHome className={s.filled} />,
            label: "Home",
            path: paths.dashboard.replace("/*", ""),
          },
          ...(checkPermission("quote_read")
            ? [
                {
                  icon: <IoPricetagsOutline />,
                  activeIcon: <IoPricetags className={s.filled} />,
                  label: "Quotes",
                  path: paths.quotes,
                },
              ]
            : []),
          ...(checkPermission("order_read")
            ? [
                {
                  icon: <HiOutlineShoppingCart />,
                  activeIcon: <HiShoppingCart className={s.filled} />,
                  label: "Orders",
                  path: paths.orders,
                },
              ]
            : []),
          ...(checkPermission("invoice_read")
            ? [
                {
                  icon: <PiInvoiceLight />,
                  activeIcon: <PiInvoiceFill className={s.filled} />,
                  label: "Invoices",
                  path: paths.sales,
                },
              ]
            : []),
          ...(checkPermission("purchase_read")
            ? [
                {
                  icon: <RiShoppingBag2Line />,
                  activeIcon: <RiShoppingBag2Fill className={s.filled} />,
                  label: "Purchases",
                  path: paths.purchases,
                },
              ]
            : []),
          ...(checkPermission("reciept_read")
            ? [
                {
                  icon: <IoReceiptOutline />,
                  activeIcon: <IoReceipt className={s.filled} />,
                  label: "Receipts",
                  path: paths.receipts,
                },
              ]
            : []),
          ...(checkPermission("payment_read")
            ? [
                {
                  icon: <RiMoneyDollarBoxLine />,
                  activeIcon: <RiMoneyDollarBoxFill className={s.filled} />,
                  label: "Payments",
                  path: paths.payments,
                },
              ]
            : []),
          ...(checkPermission("dynamic_table_read")
            ? [
                {
                  icon: <PiTableLight style={{ fontSize: "1.2em" }} />,
                  activeIcon: (
                    <PiTableFill
                      className={s.filled}
                      style={{ fontSize: "1.2em" }}
                    />
                  ),
                  label: "Manage Data",
                  path: paths.dynamicTables.replace("/*", ""),
                },
              ]
            : []),
          ...(checkPermission("chat_read")
            ? [
                {
                  icon: <IoChatbubblesOutline style={{ fontSize: "1.2em" }} />,
                  activeIcon: (
                    <IoChatbubbles
                      className={s.filled}
                      style={{ fontSize: "1.2em" }}
                    />
                  ),
                  label: "Chats",
                  path: paths.chats,
                },
              ]
            : []),
          ...(checkPermission("role_read")
            ? [
                {
                  icon: <IoShieldCheckmarkOutline />,
                  activeIcon: <IoShieldCheckmark className={s.filled} />,
                  label: "Roles",
                  path: paths.roles,
                },
              ]
            : []),
          ...(checkPermission("employee_read")
            ? [
                {
                  icon: <HiOutlineUserGroup />,
                  activeIcon: <HiUserGroup className={s.filled} />,
                  label: "Staffs",
                  path: paths.employees,
                },
              ]
            : []),
          ...(["company", "admin"].includes(userType)
            ? [
                {
                  icon: <BsGear />,
                  activeIcon: <BsGearFill className={s.filled} />,
                  label: "Settings",
                  path: paths.settings.baseUrl,
                },
              ]
            : []),
          ...(["staff", "admin"].includes(userType)
            ? [
                {
                  icon: (
                    <MdOutlineBusinessCenter style={{ fontSize: "1.2em" }} />
                  ),
                  activeIcon: (
                    <MdBusinessCenter
                      style={{ fontSize: "1.2em" }}
                      className={s.filled}
                    />
                  ),
                  label: "Businesses",
                  path: paths.businesses,
                },
              ]
            : []),
        ]}
        setSidebarOpen={setSidebarOpen}
      />

      <div className={s.content}>
        <Routes>
          {checkPermission("quote_read") && (
            <Route
              path={paths.quotes}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <Quotes setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
          )}
          {checkPermission("order_read") && (
            <Route
              path={paths.orders}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <Orders setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
          )}
          {checkPermission("invoice_read") && (
            <Route
              path={paths.sales}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <Invoices setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
          )}
          {checkPermission("purchase_read") && (
            <Route
              path={paths.purchases}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <Purchases setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
          )}
          {checkPermission("reciept_read") && (
            <Route
              path={paths.receipts}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <Receipts setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
          )}
          {checkPermission("payment_read") && (
            <Route
              path={paths.payments}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <Payments setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
          )}
          {checkPermission("dynamic_table_read") && (
            <Route
              path={paths.dynamicTables}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <DynamicTables setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
          )}
          {checkPermission("role_read") && (
            <Route
              path={paths.roles}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <Roles setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
          )}
          {checkPermission("employee_read") && (
            <Route
              path={paths.employees}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <Employees setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
          )}
          {checkPermission("chat_read") && (
            <Route
              path={paths.chats}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <Chats setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
          )}
          {userType === "staff" && (
            <Route
              path={paths.businesses}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <Businesses setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
          )}
          {userType === "admin" && (
            <Route
              path={paths.businesses}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <AdminBusinesses setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
          )}
          {["company", "admin"].includes(userType) && (
            <Route
              path={paths.settings.baseUrl}
              element={
                <Suspense fallback={<SettingLoading />}>
                  <Settings setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
          )}
          <Route
            path={"/"}
            element={
              <Suspense fallback={<SettingLoading />}>
                <Home setSidebarOpen={setSidebarOpen} />
              </Suspense>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

const Sidebar = ({ sidebarOpen, sidebarItems, setSidebarOpen }) => {
  const { user, setUser, setConfig } = useContext(SiteContext);
  const location = useLocation();
  const navigate = useNavigate();

  const { post: logout } = useFetch(
    endpoints[`${user?.userType}Logout`] || "/"
  );

  return (
    <>
      <div className={`${s.header} ${sidebarOpen ? s.open : ""}`}>
        <div>
          <div
            className={`${s.user} ${user.userType === "staff" ? s.staff : ""}`}
          >
            <div className={s.profile}>
              <Link
                to={paths.dashboard.base + paths.dashboard.profile}
                onClick={() => setSidebarOpen(false)}
              >
                {user.logo || user.photo ? (
                  <img
                    src={user?.logo || user?.photo}
                    alt={`${user?.name} Logo`}
                    onError={(e) => {
                      e.target.src = "/assets/user.png";
                    }}
                  />
                ) : (
                  <FaRegUser />
                )}
              </Link>
            </div>
            <div>
              <h2 className={"ellipsis l-1"}>{user.name}</h2>
              <p className={s.role}>{user.role?.name}</p>
            </div>
          </div>
        </div>

        <ul className={s.links}>
          {sidebarItems.map((item, i, arr) => {
            let div = null;
            if (i > 0 && item.section !== arr[i - 1].section) {
              div = (
                <li className={s.divider} key={i}>
                  <hr />
                </li>
              );
            }
            const URL = ({ children }) => {
              if (item.target) {
                return (
                  <a
                    href={item.path}
                    target={item.target}
                    onClick={() => {
                      if (window.innerWidth <= 480) {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    {children}
                  </a>
                );
              }
              return (
                <Link
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth <= 480) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  {children}
                </Link>
              );
            };
            return (
              <Fragment key={i}>
                {div}
                <li
                  className={
                    location?.pathname.startsWith(`/dashboard/${item.path}`)
                      ? s.active
                      : ""
                  }
                >
                  <URL>
                    <span
                      className={s.icon}
                      style={{
                        transitionDelay: `${
                          (window.innerWidth <= 480 ? 500 : 0) +
                          50 * (sidebarOpen ? i : arr.length - i)
                        }ms`,
                      }}
                    >
                      {item.icon}
                      {item.activeIcon}
                    </span>
                    <span
                      className={s.label}
                      style={{
                        transitionDelay: `${
                          (window.innerWidth <= 480 ? 500 : 0) +
                          50 * (sidebarOpen ? i : arr.length - i)
                        }ms`,
                      }}
                    >
                      {item.label}
                    </span>
                  </URL>
                </li>
              </Fragment>
            );
          })}
        </ul>

        <div className={`${s.actions} flex gap-1 center`}>
          <a href={`${process.env.REACT_APP_PUBLIC_AUTH_APP_URL}/dashboard`}>
            <button title="Micro Apps" className={`clear ${s.logoutBtn}`}>
              <FaArrowLeftLong />
            </button>
          </a>
          <button
            title="Log out"
            className={`clear ${s.logoutBtn}`}
            onClick={() => {
              Prompt({
                type: "confirmation",
                message: "Are you sure you want to log out?",
                callback: () => {
                  logout().then(({ data }) => {
                    if (data.success) {
                      setUser(null);
                      setConfig(null);
                      window.location.href = `${process.env.REACT_APP_PUBLIC_AUTH_APP_URL}/signin?_target=${window.location.origin}/dashboard`;
                    }
                  });
                },
              });
            }}
          >
            <RxExit />
          </button>
        </div>

        <footer>
          © {new Date().getFullYear()} Infin AI Technologies,
          <br /> All Rights Reserved.
        </footer>
      </div>

      <div
        className={s.sidebarBackdrop}
        onClick={() => setSidebarOpen(false)}
      />
    </>
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
