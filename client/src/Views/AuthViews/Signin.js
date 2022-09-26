import { useState, useContext } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
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
  const { setUser } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({ resolver: useYup(validationSchema) });
  const navigate = useNavigate();
  const [invalidCred, setInvalidCred] = useState(false);
  const { post: login, loading } = useFetch(endpoints.signIn);
  return (
    <form
      className="grid gap-1 p-1 m-a"
      onSubmit={handleSubmit((values) => {
        setInvalidCred(false);
        login({ phone: values.phone, password: values.password }).then(
          ({ error, data }) => {
            if (error) {
              return Prompt({
                type: "error",
                message: error.message || error,
              });
            }
            if (data.success) {
              setUser(data.data);
              sessionStorage.setItem("access_token", data.token);
              navigate("/", { replace: true });
            } else {
              setInvalidCred(true);
            }
          }
        );
      })}
    >
      <img className={s.illustration} src="/assets/infinAI.png" />
      <h1 className="text-center">Biz Com</h1>
      <h2>Sign In</h2>
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
      <button className="btn">Sign In</button>
      <Link to={paths.signUp}>Create New Account</Link>
    </form>
  );
};

export default Form;
