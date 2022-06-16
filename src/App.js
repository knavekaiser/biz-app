import "./App.scss";
import { useEffect, useContext } from "react";
import { SiteContext } from "SiteContext";
import { useNavigate, useLocation } from "react-router-dom";
import { paths } from "config";

import AuthView from "Views/AuthViews";
import Dashboard from "Views/Dashboard";

Number.prototype.getPercentage = function (n) {
  return 100 - (this - n) / (this / 100);
};
Number.prototype.percent = function (n) {
  return (this / 100) * n;
};

var a = [
  "",
  "one ",
  "two ",
  "three ",
  "four ",
  "five ",
  "six ",
  "seven ",
  "eight ",
  "nine ",
  "ten ",
  "eleven ",
  "twelve ",
  "thirteen ",
  "fourteen ",
  "fifteen ",
  "sixteen ",
  "seventeen ",
  "eighteen ",
  "nineteen ",
];
var b = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

function resizeWindow() {
  let vh = window.innerHeight * 0.01;
  document.body.style.setProperty("--vh", `${vh}px`);
}

Number.prototype.toWords = function () {
  if (this.toString().length > 9) return this;
  let n = ("000000000" + this)
    .substr(-9)
    .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return;
  var str = "";
  str +=
    n[1] != 0
      ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "crore "
      : "";
  str +=
    n[2] != 0
      ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "lakh "
      : "";
  str +=
    n[3] != 0
      ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "thousand "
      : "";
  str +=
    n[4] != 0
      ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "hundred "
      : "";
  str +=
    n[5] != 0
      ? (str != "" ? "and " : "") +
        (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) +
        "only "
      : "";
  return str;
};

function App() {
  const { user } = useContext(SiteContext);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!user) {
      navigate("/signin");
    } else if ([paths.signIn, paths.signUp].includes(location.pathname)) {
      navigate("/");
    }
  }, [user]);

  useEffect(() => {
    window.addEventListener("resize", () => resizeWindow());
    resizeWindow();
  }, []);

  if (!user) {
    return (
      <div className="App">
        <AuthView />
      </div>
    );
  }
  return (
    <div className={"App"}>
      <Dashboard />
    </div>
  );
}

export default App;
