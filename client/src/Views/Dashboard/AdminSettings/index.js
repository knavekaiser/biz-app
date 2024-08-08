import { Tabs } from "Components/elements";
import s from "./settings.module.scss";
import { paths } from "config";
import { Routes, Route } from "react-router-dom";

import SiteConfig from "./siteConfig";
import { BsList } from "react-icons/bs";

const Settings = ({ setSidebarOpen }) => {
  return (
    <div className={s.container}>
      <div className={`flex`}>
        <div
          className={`flex align-center pointer gap_5  ml-1`}
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <BsList style={{ fontSize: "1.75rem" }} />
          <h2>Settings</h2>
        </div>
      </div>
      <Tabs tabs={[{ label: "Site Configurations", path: "site-config" }]} />
      <Routes>
        <Route path={paths.settings.siteConfig} element={<SiteConfig />} />
      </Routes>
    </div>
  );
};

export default Settings;
