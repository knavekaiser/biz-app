import "./App.scss";
import { useEffect, useContext, lazy, Suspense } from "react";
import { SiteContext } from "SiteContext";
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  useSearchParams,
} from "react-router-dom";
import { paths, endpoints } from "config";
import { Prompt } from "Components/modal";
import { CgSpinner } from "react-icons/cg";
import { useFetch } from "hooks";

import { loadScript } from "helpers";

const Dashboard = lazy(() => import("Views/Dashboard"));
const Home = lazy(() => import("Views/Home"));
const AuthView = lazy(() => import("Views/AuthViews"));

function resizeWindow() {
  let vh = window.innerHeight * 0.01;
  document.body.style.setProperty("--vh", `${vh}px`);
}

function App() {
  const { setUser, userType } = useContext(SiteContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const { get: getProfile } = useFetch(endpoints[`${userType}Profile`]);

  useEffect(() => {
    window.addEventListener("resize", () => resizeWindow());
    resizeWindow();

    // if (!document.cookie.includes("access_token")) {
    //   return;
    // }

    const access_token = searchParams.get("access_token");

    getProfile(
      access_token
        ? {
            headers: {
              "x-set-cookie": "true",
              "x-access-token": access_token,
            },
          }
        : {}
    )
      .then(({ data }) => {
        if (data.success) {
          localStorage.setItem("userType", data.data.userType);
          setUser(data.data);
          setSearchParams((prev) => {
            prev.delete("access_token");
            return prev;
          });
          // const path = ["/signin", "/signup"].includes(location.pathname)
          //   ? paths.home
          //   : location.pathname || paths.home;
          // navigate(path, { replace: true });
        }
      })
      .catch((err) => Prompt({ type: "error", message: err.message }));

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
        <Route
          path="*"
          element={
            <Suspense fallback={<CgSpinner className="loadingSpinner" />}>
              <AuthView />
            </Suspense>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
