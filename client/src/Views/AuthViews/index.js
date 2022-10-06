import { useContext, useEffect } from "react";
import { SiteContext } from "SiteContext";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Signup from "./Signup";
import SignIn from "./Signin";
import ResetPassword from "./ResetPassword";
import { paths } from "config";

import s from "./auth.module.scss";

const Auth = () => {
  const { user } = useContext(SiteContext);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, location]);
  return (
    <div className={s.container}>
      <Routes>
        <Route path={paths.signUp} element={<Signup />} />
        <Route path={paths.signIn} element={<SignIn />} />
        <Route path={paths.resetPassword} element={<ResetPassword />} />
      </Routes>
      <img
        className={s.background}
        src={`https://images.unsplash.com/photo-1568279668196-697fbf5249ca?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=${window.innerWidth}&q=80`}
      />
      <footer>© 2022 InfinAI Technologies, All Rights Reserved.</footer>
    </div>
  );
};

export default Auth;
