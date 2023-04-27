import "./App.scss";
import { useEffect, useContext } from "react";
import { SiteContext } from "SiteContext";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { paths, endpoints } from "config";
import { Prompt } from "Components/modal";
import { useFetch } from "hooks";

import Dashboard from "Views/Dashboard";
import Home from "Views/Home";
import AuthView from "Views/AuthViews";
// import { LoadScript } from "@react-google-maps/api";

function resizeWindow() {
  let vh = window.innerHeight * 0.01;
  document.body.style.setProperty("--vh", `${vh}px`);
}

function App() {
  const { user, setUser, userType } = useContext(SiteContext);
  const navigate = useNavigate();
  const location = useLocation();

  const { get: getProfile } = useFetch(endpoints[`${userType}Profile`]);

  useEffect(() => {
    window.addEventListener("resize", () => resizeWindow());
    resizeWindow();

    if (!sessionStorage.getItem("access_token")) {
      return;
    }

    getProfile()
      .then(({ data }) => {
        if (data.success) {
          localStorage.setItem("userType", data.data.userType);
          setUser(data.data);
          const path = ["/signin", "/signup"].includes(location.pathname)
            ? paths.home
            : location.pathname || paths.home;
          navigate(path, { replace: true });
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));
  }, []);

  return (
    <div className={"App"}>
      <Routes>
        <Route path={paths.home} element={<Home />} />
        <Route path={paths.dashboard} element={<Dashboard />} />
        <Route path="*" element={<AuthView />} />
      </Routes>
      {/* {!window.google && (
        <LoadScript
          loadingElement={<div style={{ display: "none" }}>Loading...</div>}
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAP_API_KEY}
          libraries={["places"]}
        />
      )} */}
    </div>
  );
}

export default App;
