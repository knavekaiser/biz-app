import { useContext, useEffect } from "react";
import { SiteContext } from "SiteContext";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Signup from "./Signup";
import SignIn from "./Signin";
import ResetPassword from "./ResetPassword";
import StaffSignup from "./StaffSignup";
import StaffSignin from "./StaffSignin";
import StaffResetPassword from "./StaffResetPassword";
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
        <Route path={paths.staffSignIn} element={<StaffSignin />} />
        <Route path={paths.staffSignUp} element={<StaffSignup />} />
        <Route
          path={paths.staffResetPassword}
          element={<StaffResetPassword />}
        />
      </Routes>
      <img
        className={s.background}
        src={`https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=${window.innerWidth}&h=${window.innerHeight}&q=100`}
      />
      <footer>© 2023 Comify Technologies, All Rights Reserved.</footer>
    </div>
  );
};

export default Auth;
