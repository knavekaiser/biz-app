import { useContext, useEffect } from "react";
import { SiteContext } from "SiteContext";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { Tabs } from "Components/elements";
import Settings from "./Settings";
import { paths, endpoints } from "config";
import { useFetch } from "hooks";

import { FaPowerOff } from "react-icons/fa";

import s from "./dashboard.module.scss";

import Sales from "./Sales";
import Purchases from "./Purchases";
import Receipts from "./Receipts";
import Payments from "./Payments";

const Dashboard = () => {
  const { user, setUser, setConfig } = useContext(SiteContext);
  const navigate = useNavigate();

  const { post: logout } = useFetch(endpoints.logout);

  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, []);
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
            { label: "Sales", path: paths.sales },
            { label: "Purchases", path: paths.purchases },
            { label: "Receipts", path: paths.receipts },
            { label: "Payments", path: paths.payments },
            { label: "Settings", path: paths.settings.baseUrl },
          ]}
        />
      </div>
      <Routes>
        <Route path={paths.sales} element={<Sales />} />
        <Route path={paths.purchases} element={<Purchases />} />
        <Route path={paths.receipts} element={<Receipts />} />
        <Route path={paths.payments} element={<Payments />} />
        <Route path={paths.settings.baseUrl} element={<Settings />} />
      </Routes>
      <footer>© 2022 InfinAI Technologies, All Rights Reserved.</footer>
    </div>
  );
};

export default Dashboard;
