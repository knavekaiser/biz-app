import { useContext, useEffect } from "react";
import { SiteContext } from "SiteContext";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Settings from "./Settings";

import { FaPowerOff } from "react-icons/fa";

import s from "./dashboard.module.scss";

import Sales from "./Sales";

const Dashboard = () => {
  const { user, setUser } = useContext(SiteContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, []);
  return (
    <div className={s.container}>
      <div className={s.header}>
        <h2>Dashboard</h2>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/settings">Settings</Link>
        </nav>
        <button
          className={`clear ${s.logoutBtn}`}
          title="Log out"
          onClick={() => {
            setUser(null);
          }}
        >
          <FaPowerOff />
        </button>
      </div>
      <Routes>
        <Route path="/" element={<Sales />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
};

export default Dashboard;
