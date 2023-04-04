import { Tabs } from "Components/elements";
import s from "./settings.module.scss";
import { paths } from "config";
import { Routes, Route } from "react-router-dom";

import SiteConfig from "./siteConfig";

const Settings = () => {
  return (
    <div className={s.container}>
      <Tabs tabs={[{ label: "Site Configurations", path: "site-config" }]} />
      <Routes>
        <Route path={paths.settings.siteConfig} element={<SiteConfig />} />
      </Routes>
    </div>
  );
};

export default Settings;
