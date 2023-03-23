import { useState, useContext } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Input } from "Components/elements";
import { useYup, useFetch } from "hooks";
import { paths, endpoints } from "config";
import { Prompt } from "Components/modal";
import * as yup from "yup";
import s from "./auth.module.scss";

const validationSchema = yup.object({
  phone: yup.string().required("Required"),
  password: yup.string().required("Required"),
});

const Form = () => {
  const { setUser, userType, setUserType } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({ resolver: useYup(validationSchema) });
  const location = useLocation();
  const navigate = useNavigate();
  const [invalidCred, setInvalidCred] = useState(false);
  const { post: login, loading } = useFetch(endpoints[`${userType}SignIn`]);
  return (
    <form
      className="grid gap-1 p-1 m-a"
      onSubmit={handleSubmit((values) => {
        setInvalidCred(false);
        login({ phone: values.phone, password: values.password })
          .then(({ data }) => {
            localStorage.setItem("userType", data.userType);
            if (data.success) {
              setUser(data.data);
              sessionStorage.setItem("access_token", data.token);
              const path = ["/signin", "/signup"].includes(location.pathname)
                ? paths.home
                : location.pathname || paths.home;
              // console.log(path);
              navigate(path, { replace: true });
            } else {
              setInvalidCred(true);
            }
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
    >
      <img className={s.illustration} src="/assets/comify.png" />
      <div className={`grid gap-1`}>
        <h1 className="text-center">Comify Studio</h1>
        <div className="flex justify-space-between align-center">
          <h2>Sign In as</h2>
        </div>
        <ul className={s.userTypes}>
          <li
            className={userType === "business" ? s.active : ""}
            onClick={() => {
              setUserType("business");
              localStorage.setItem("userType", "business");
            }}
          >
            Business
          </li>
          <li
            className={userType === "admin" ? s.active : ""}
            onClick={() => {
              setUserType("admin");
              localStorage.setItem("userType", "admin");
            }}
          >
            Admin
          </li>
          <li
            className={userType === "staff" ? s.active : ""}
            onClick={() => {
              setUserType("staff");
              localStorage.setItem("userType", "staff");
            }}
          >
            Staff
          </li>
        </ul>
        {invalidCred && <p className="error">Invalid credentials</p>}
        <Input
          required
          label="Phone"
          {...register("phone")}
          error={errors.phone}
        />
        <Input
          required
          label="Password"
          type="password"
          {...register("password")}
          error={errors.password}
        />
        <Link className={s.resetPasswordLink} to={paths.resetPassword}>
          Forgot Password?
        </Link>
        <button className="btn" disabled={loading}>
          Sign In
        </button>
        <Link to={paths.signUp}>Create New Account</Link>
      </div>
    </form>
  );
};

export default Form;
