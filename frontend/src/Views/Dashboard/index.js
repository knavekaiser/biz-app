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
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { paths } from "config";
import { FaArrowLeftLong } from "react-icons/fa6";

import s from "./dashboard.module.scss";
import { FaBoxes, FaRegUser } from "react-icons/fa";
import { Prompt } from "Components/modal";
import { useFetch } from "hooks";
import { endpoints } from "config";

import { RxExit } from "react-icons/rx";
import { MdBusinessCenter, MdOutlineBusinessCenter } from "react-icons/md";
import {
  PiLineSegments,
  PiLineSegmentsFill,
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
  IoSettingsOutline,
  IoShieldCheckmark,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import {
  BsCart3,
  BsCartFill,
  BsDiagram2,
  BsDiagram2Fill,
  BsFillTagsFill,
  BsGear,
  BsGearFill,
  BsHouseDoor,
  BsHouseDoorFill,
  BsList,
  BsTags,
} from "react-icons/bs";
import {
  HiOutlineShoppingCart,
  HiOutlineUserGroup,
  HiShoppingCart,
  HiUserGroup,
} from "react-icons/hi";
import { PiInvoiceFill, PiInvoiceLight } from "react-icons/pi";
import {
  RiBookletFill,
  RiBookletLine,
  RiMoneyDollarBoxFill,
  RiMoneyDollarBoxLine,
  RiShoppingBag2Fill,
  RiShoppingBag2Line,
} from "react-icons/ri";
import { CiBoxes } from "react-icons/ci";
import { CgSpinner } from "react-icons/cg";
import { Combobox } from "Components/elements";
import { useForm } from "react-hook-form";

const Home = lazy(() => import("./Home"));
const Settings = lazy(() => import("./Settings"));
const FinPeriods = lazy(() => import("./FinPeriods"));
const Businesses = lazy(() => import("./Businesses"));
const AdminBusinesses = lazy(() => import("./AdminBusinesses"));
const Invoices = lazy(() => import("./Sales"));
const SalesReturns = lazy(() => import("./SalesReturns"));
const Orders = lazy(() => import("./Orders"));
const Quotes = lazy(() => import("./Quotes"));
const Purchases = lazy(() => import("./Purchases"));
const PurchaseReturns = lazy(() => import("./PurchaseReturns"));
const Receipts = lazy(() => import("./Receipts"));
const Payments = lazy(() => import("./Payments"));
const Journals = lazy(() => import("./Journals"));
const DynamicTables = lazy(() => import("./DynamicTables"));
const Roles = lazy(() => import("./Roles"));
const Employees = lazy(() => import("./Employees"));
const Chats = lazy(() => import("./Chats"));
const Reports = lazy(() => import("./Reports"));
const Accounting = lazy(() => import("./Accounting"));
const Inventory = lazy(() => import("./Inventory"));

const Dashboard = () => {
  const { user, business, userType, finPeriod, checkPermission } =
    useContext(SiteContext);
  const [sidebarItems, setSidebarItems] = useState([
    {
      icon: <BsHouseDoor style={{ fontSize: "1.2em", marginTop: "-0.15em" }} />,
      activeIcon: (
        <BsHouseDoorFill
          style={{ fontSize: "1.2em", marginTop: "-0.15em" }}
          className={s.filled}
        />
      ),
      label: "Home",
      path: paths.dashboard.replace("/*", ""),
    },
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1220);
  const navigate = useNavigate();

  useEffect(() => {
    let menuItems = [];
    if (
      finPeriod &&
      (userType === "company" || (userType === "staff" && business))
    ) {
      menuItems = [
        {
          section: "home",
          icon: <BsHouseDoor />,
          activeIcon: <BsHouseDoorFill className={s.filled} />,
          label: "Home",
          path: paths.dashboard.replace("/*", ""),
        },
      ];
      if (["admin"].includes(userType)) {
        menuItems.push({
          section: "home",
          icon: <MdOutlineBusinessCenter style={{ fontSize: "1.2em" }} />,
          activeIcon: (
            <MdBusinessCenter
              style={{ fontSize: "1.2em" }}
              className={s.filled}
            />
          ),
          label: "Businesses",
          path: paths.businesses,
        });
      }
      menuItems.push({
        section: "home",
        icon: <PiUsersFour style={{ fontSize: "1.2em" }} />,
        activeIcon: (
          <PiUsersFourFill className={s.filled} style={{ fontSize: "1.2em" }} />
        ),
        label: "Micro Apps",
        path: "https://crm.infinai.in",
        target: "_blank",
      });
      menuItems.push({
        section: "collection",
        icon: (
          <BsDiagram2
            style={{ marginTop: "0.2em", transform: "rotate(-90deg)" }}
          />
        ),
        activeIcon: (
          <BsDiagram2Fill
            style={{ marginTop: "0.2em", transform: "rotate(-90deg)" }}
            className={s.filled}
          />
        ),
        label: "Accounting",
        path: paths.accounting,
      });
      menuItems.push({
        section: "collection",
        icon: <CiBoxes style={{ marginTop: "0.2em" }} />,
        activeIcon: (
          <FaBoxes style={{ marginTop: "0.2em" }} className={s.filled} />
        ),
        label: "Inventory",
        path: paths.inventory,
      });
      if (checkPermission("quote_read")) {
        menuItems.push({
          section: "collection",
          icon: <BsTags style={{ marginTop: "0.15em" }} />,
          activeIcon: (
            <BsFillTagsFill
              style={{ marginTop: "0.15em" }}
              className={s.filled}
            />
          ),
          label: "Quotes",
          path: paths.quotes,
        });
      }
      if (checkPermission("order_read")) {
        menuItems.push({
          section: "collection",
          icon: <BsCart3 />,
          activeIcon: <BsCartFill className={s.filled} />,
          label: "Orders",
          path: paths.orders,
        });
      }
      if (checkPermission("invoice_read")) {
        menuItems.push({
          section: "collection",
          icon: <PiInvoiceLight style={{ fontSize: "1.15em" }} />,
          activeIcon: (
            <PiInvoiceFill
              style={{ fontSize: "1.15em" }}
              className={s.filled}
            />
          ),
          label: "Invoices",
          path: paths.sales,
        });
      }
      if (checkPermission("sales_return_read")) {
        menuItems.push({
          section: "collection",
          icon: <PiInvoiceLight style={{ fontSize: "1.15em" }} />,
          activeIcon: (
            <PiInvoiceFill
              style={{ fontSize: "1.15em" }}
              className={s.filled}
            />
          ),
          label: "Sales Returns",
          path: paths.salesReturns,
        });
      }
      if (checkPermission("purchase_read")) {
        menuItems.push({
          section: "collection",
          icon: <RiShoppingBag2Line style={{ fontSize: "1.1em" }} />,
          activeIcon: (
            <RiShoppingBag2Fill
              style={{ fontSize: "1.1em" }}
              className={s.filled}
            />
          ),
          label: "Purchases",
          path: paths.purchases,
        });
      }
      if (checkPermission("purchase_return_read")) {
        menuItems.push({
          section: "collection",
          icon: <RiShoppingBag2Line style={{ fontSize: "1.1em" }} />,
          activeIcon: (
            <RiShoppingBag2Fill
              style={{ fontSize: "1.1em" }}
              className={s.filled}
            />
          ),
          label: "Purchase Returns",
          path: paths.purchaseReturns,
        });
      }
      if (checkPermission("reciept_read")) {
        menuItems.push({
          section: "collection",
          icon: <IoReceiptOutline />,
          activeIcon: <IoReceipt className={s.filled} />,
          label: "Receipts",
          path: paths.receipts,
        });
      }
      if (checkPermission("payment_read")) {
        menuItems.push({
          section: "collection",
          icon: <RiMoneyDollarBoxLine style={{ fontSize: "1.1em" }} />,
          activeIcon: (
            <RiMoneyDollarBoxFill
              style={{ fontSize: "1.1em" }}
              className={s.filled}
            />
          ),
          label: "Payments",
          path: paths.payments,
        });
      }
      if (checkPermission("journal_read")) {
        menuItems.push({
          section: "collection",
          icon: <RiBookletLine style={{ fontSize: "1.1em" }} />,
          activeIcon: (
            <RiBookletFill style={{ fontSize: "1.1em" }} className={s.filled} />
          ),
          label: "Journals",
          path: paths.journals,
        });
      }
      menuItems.push({
        icon: <PiLineSegments style={{ fontSize: "1.2em" }} />,
        activeIcon: (
          <PiLineSegmentsFill
            className={s.filled}
            style={{ fontSize: "1.2em" }}
          />
        ),
        label: "Reports",
        path: paths.reports,
      });
      if (checkPermission("dynamic_table_read")) {
        menuItems.push({
          icon: <PiTableLight style={{ fontSize: "1.2em" }} />,
          activeIcon: (
            <PiTableFill className={s.filled} style={{ fontSize: "1.2em" }} />
          ),
          label: "Manage Data",
          path: paths.dynamicTables.replace("/*", ""),
        });
      }
      if (checkPermission("chat_read")) {
        menuItems.push({
          icon: <IoChatbubblesOutline style={{ fontSize: "1.2em" }} />,
          activeIcon: (
            <IoChatbubbles className={s.filled} style={{ fontSize: "1.2em" }} />
          ),
          label: "Chats",
          path: paths.chats,
        });
      }
      if (checkPermission("employee_read")) {
        menuItems.push({
          section: "management",
          icon: <HiOutlineUserGroup />,
          activeIcon: <HiUserGroup className={s.filled} />,
          label: "Staffs",
          path: paths.employees,
        });
      }
      if (checkPermission("role_read")) {
        menuItems.push({
          section: "management",
          icon: <IoShieldCheckmarkOutline />,
          activeIcon: <IoShieldCheckmark className={s.filled} />,
          label: "Roles",
          path: paths.roles,
        });
      }
      if (["company", "admin"].includes(userType)) {
        menuItems.push({
          section: "management",
          icon: <BsGear />,
          activeIcon: <BsGearFill className={s.filled} />,
          label: "Settings",
          path: paths.settings.baseUrl,
        });
      }
    } else if (userType === "staff" && !business) {
      menuItems = [
        {
          section: "home",
          icon: <BsHouseDoor />,
          activeIcon: <BsHouseDoorFill className={s.filled} />,
          label: "Home",
          path: paths.dashboard.replace("/*", ""),
        },
        // {
        //   section: "home",
        //   icon: <MdOutlineBusinessCenter style={{ fontSize: "1.2em" }} />,
        //   activeIcon: (
        //     <MdBusinessCenter
        //       style={{ fontSize: "1.2em" }}
        //       className={s.filled}
        //     />
        //   ),
        //   label: "Businesses",
        //   path: paths.businesses,
        // },
        {
          section: "other-app",
          icon: <PiUsersFour style={{ fontSize: "1.2em" }} />,
          activeIcon: (
            <PiUsersFourFill
              className={s.filled}
              style={{ fontSize: "1.2em" }}
            />
          ),
          label: "Micro Apps",
          path: "https://crm.infinai.in",
          target: "_blank",
        },
      ];
    }

    setSidebarItems(menuItems);
  }, [userType, user, business, finPeriod]);

  useEffect(() => {
    if (!finPeriod && checkPermission("fin_period_creat")) {
      navigate(paths.finPeriods);
    }
  }, [finPeriod]);

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
  if (!finPeriod) {
    return (
      <div className={s.container}>
        <Sidebar
          sidebarOpen={sidebarOpen}
          sidebarItems={sidebarItems}
          setSidebarOpen={setSidebarOpen}
        />

        <div className={s.content}>
          <Routes>
            {checkPermission("fin_period_read") && (
              <Route
                path={paths.finPeriods}
                element={
                  <Suspense fallback={<LoadingSaklleton />}>
                    <FinPeriods setSidebarOpen={setSidebarOpen} />
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
  }

  return (
    <div className={s.container}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        sidebarItems={sidebarItems}
        setSidebarOpen={setSidebarOpen}
      />

      <div className={s.content}>
        <Routes>
          {checkPermission("fin_period_read") && (
            <Route
              path={paths.finPeriods}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <FinPeriods setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
          )}
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
          {checkPermission("sales_return_read") && (
            <Route
              path={paths.salesReturns}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <SalesReturns setSidebarOpen={setSidebarOpen} />
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
          {checkPermission("purchase_return_read") && (
            <Route
              path={paths.purchaseReturns}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <PurchaseReturns setSidebarOpen={setSidebarOpen} />
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
          {checkPermission("journal_read") && (
            <Route
              path={paths.journals}
              element={
                <Suspense fallback={<LoadingSaklleton />}>
                  <Journals setSidebarOpen={setSidebarOpen} />
                </Suspense>
              }
            />
          )}
          <Route
            path={paths.reports}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <Reports setSidebarOpen={setSidebarOpen} />
              </Suspense>
            }
          />
          <Route
            path={paths.accounting}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <Accounting setSidebarOpen={setSidebarOpen} />
              </Suspense>
            }
          />
          <Route
            path={paths.inventory}
            element={
              <Suspense fallback={<LoadingSaklleton />}>
                <Inventory setSidebarOpen={setSidebarOpen} />
              </Suspense>
            }
          />
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
          {
            // userType === "staff" && (
            // <Route
            //   path={paths.businesses}
            //   element={
            //     <Suspense fallback={<LoadingSaklleton />}>
            //       <Businesses setSidebarOpen={setSidebarOpen} />
            //     </Suspense>
            //   }
            // />
            // )
          }
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
  const { user, setUser, userType, setConfig } = useContext(SiteContext);
  const location = useLocation();

  const { post: logout } = useFetch(
    endpoints[`${user?.userType}Logout`] || "/"
  );

  return (
    <>
      <div className={`${s.header} ${sidebarOpen ? s.open : ""}`}>
        <div
          className={`${s.user} ${user.userType === "staff" ? s.staff : ""}`}
        >
          <div className={s.profile}>
            {/* <Link
                to={paths.dashboard.base + paths.dashboard.profile}
                onClick={() => setSidebarOpen(false)}
              > */}
            {user.logo || user.businesses?.[0]?.business?.logo || user.photo ? (
              <img
                src={
                  process.env.REACT_APP_PUBLIC_R2_URL +
                  (user?.logo ||
                    user.businesses?.[0]?.business?.logo ||
                    user?.photo)
                }
                alt={`${user?.name} Logo`}
                onError={(e) => {
                  e.target.src = "/assets/user.png";
                }}
              />
            ) : (
              <FaRegUser style={{ transform: "translateY(-2px)" }} />
            )}
            {/* </Link> */}
          </div>
          <div>
            {user.userType === "staff" ? (
              <>
                <h2 className={"ellipsis l-1"}>
                  {user.businesses?.[0]?.business?.name}
                </h2>
                <p className={s.role}>{user.name}</p>
              </>
            ) : (
              <h2 className={"ellipsis l-1"}>{user.name}</h2>
            )}
            {/* <p className={s.role}>
                {user.businesses?.[0]?.roles.map((role) => role.name)}
              </p> */}
          </div>
        </div>

        {sidebarOpen &&
          userType === "staff" &&
          user?.businesses?.length > 1 && <BusinessPicker />}

        {sidebarOpen && <FinPeriodPicker />}

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
                      window.location.href = `${process.env.REACT_APP_PUBLIC_AUTH_APP_URL}/signin?_target=${window.location.origin}/dashboard/accounting`;
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

const BusinessPicker = () => {
  const { user, business, setBusiness, setConfig } = useContext(SiteContext);
  const { control, watch, setValue } = useForm({
    defaultValues: { business: business?._id || "" },
  });
  const currBusiness = watch("business");
  useEffect(() => {
    if (business && !currBusiness && user?.businesses?.length) {
      setValue("business", user.businesses[0].business._id);
    }
  }, [business, currBusiness]);
  return (
    <Combobox
      label="Business"
      control={control}
      name="business"
      options={(user?.businesses || []).map((item) => ({
        label: item.business?.name,
        value: item.business?._id,
        item,
      }))}
      onChange={(opt) => {
        setBusiness({
          business: opt.item.business,
          permissions: [
            ...(opt.item?.roles.map((item) => item.permissions) || []),
          ].flat(),
        });
        setConfig(opt.item.config);
      }}
    />
  );
};

const FinPeriodPicker = () => {
  const { finPeriod, finPeriods, setFinPeriod } = useContext(SiteContext);
  const { control, watch, setValue } = useForm({
    defaultValues: { business: finPeriod?._id || "" },
  });
  const currPeriod = watch("finPeriod");
  useEffect(() => {
    if (finPeriod && !currPeriod && finPeriods?.length) {
      setValue("finPeriod", finPeriods[0]._id);
    }
  }, [finPeriod, currPeriod]);
  return (
    <div className="flex gap_5 align-end" style={{ padding: "0 1rem" }}>
      <Combobox
        label="Financial Period"
        control={control}
        name="finPeriod"
        options={(finPeriods || []).map((item) => ({
          label: item.label,
          value: item._id,
          item,
        }))}
        onChange={(opt) => {
          setFinPeriod(opt.item);
        }}
      />
      <Link to={paths.finPeriods}>
        <button className="btn clear iconOnly" style={{ padding: 0 }}>
          <IoSettingsOutline />
        </button>
      </Link>
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
