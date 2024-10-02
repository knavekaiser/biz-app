import "./App.scss";
import { useEffect, useContext, lazy, Suspense } from "react";
import { SiteContext } from "SiteContext";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { paths, endpoints } from "config";
import { Prompt } from "Components/modal";
import { CgSpinner } from "react-icons/cg";
import { useFetch } from "hooks";

import { loadScript } from "helpers";

const Dashboard = lazy(() => import("Views/Dashboard"));
const Home = lazy(() => import("Views/Home"));

function resizeWindow() {
  let vh = window.innerHeight * 0.01;
  document.body.style.setProperty("--vh", `${vh}px`);
}

function App() {
  const { setUser, userType, setUserType, setBusiness, setConfig } =
    useContext(SiteContext);
  const navigate = useNavigate();
  const location = useLocation();

  const { get: getProfile } = useFetch(endpoints[`${userType}Profile`]);

  useEffect(() => {
    window.addEventListener("resize", () => resizeWindow());
    resizeWindow();

    getProfile()
      .then(({ data }) => {
        if (data.success) {
          localStorage.setItem("userType", data.data.userType);
          setUser(data.data);
          setUserType(data.data.userType);

          if (data.data.userType === "staff" && data.data.businesses?.length) {
            const business = data.data.businesses[0];
            setBusiness({
              business: business.business,
              permissions: [
                ...(business.roles.map((item) => item.permissions) || []),
              ].flat(),
            });
            setConfig(business.config);
          }

          // const path = ["/signin", "/signup"].includes(location.pathname)
          //   ? paths.home
          //   : location.pathname || paths.home;
          // navigate(path, { replace: true });
        }
      })
      .catch((err) => {
        if (err === 401) {
          if (location.pathname.startsWith("/dashboard")) {
            window.location.href = `${process.env.REACT_APP_PUBLIC_AUTH_APP_URL}/signin?_target=${window.location.href}/dashboard/accounting`;
          }
          return;
        }
        Prompt({ type: "error", message: err.message });
      });

    loadScript(endpoints.comifyChat).then(() => {
      if (window.InfinAI) {
        const { default: mountInfinAI } = window.InfinAI;
        mountInfinAI({
          baseUrl: endpoints.baseUrl,
          chatbotId: process.env.REACT_APP_INFINAI_CHAT_BOT,
        });
      }
    });
  }, []);

  return (
    <div className={"App"}>
      <Routes>
        <Route
          path={paths.home}
          element={
            <Suspense fallback={<CgSpinner className="loadingSpinner" />}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path={paths.dashboard}
          element={
            <Suspense fallback={<CgSpinner className="loadingSpinner" />}>
              <Dashboard />
            </Suspense>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
