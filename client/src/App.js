import "./App.scss";
import { useEffect, useContext, lazy, Suspense } from "react";
import { SiteContext } from "SiteContext";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { paths, endpoints } from "config";
import { Prompt } from "Components/modal";
import { CgSpinner } from "react-icons/cg";
import { useFetch } from "hooks";

const Dashboard = lazy(() => import("Views/Dashboard"));
const Home = lazy(() => import("Views/Home"));
const AuthView = lazy(() => import("Views/AuthViews"));

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
