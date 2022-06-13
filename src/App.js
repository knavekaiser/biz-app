import "./App.scss";
import { useEffect, useContext } from "react";
import { SiteContext } from "SiteContext";
import { useNavigate } from "react-router-dom";

import AuthView from "Views/AuthViews";
import Dashboard from "Views/Dashboard";

Number.prototype.getPercentage = function (n) {
  return 100 - (this - n) / (this / 100);
};
Number.prototype.percent = function (n) {
  return (this / 100) * n;
};

function App() {
  const { user } = useContext(SiteContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [user]);
  if (!user) {
    return (
      <div className="App">
        <AuthView />
      </div>
    );
  }
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;
