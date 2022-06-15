import { useContext, useEffect } from "react";
import { SiteContext } from "SiteContext";
import { Routes, Route, useNavigate } from "react-router-dom";
import Signup from "./Signup";
import SignIn from "./Signin";
import { paths } from "config";

import s from "./auth.module.scss";

const Auth = () => {
  const { user } = useContext(SiteContext);
  const navigate = useNavigate();
  console.log("red");
  useEffect(() => {
    console.log(user);
    if (user) {
      navigate("/");
    }
  }, [user]);
  return (
    <div className={s.container}>
      <Routes>
        <Route path={paths.signUp} element={<Signup />} />
        <Route path={paths.signIn} element={<SignIn />} />
      </Routes>
    </div>
  );
};

export default Auth;
