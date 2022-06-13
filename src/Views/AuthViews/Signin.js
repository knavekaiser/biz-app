import { useState, useContext } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Input } from "Components/elements";
import { useYup } from "hooks";
import * as yup from "yup";

const validationSchema = yup.object({
  phone: yup.string().required("Required"),
  password: yup.string().required("Required"),
});

const Form = () => {
  const { setUser } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    resolver: useYup(validationSchema),
  });
  const navigate = useNavigate();
  const [invalidCred, setInvalidCred] = useState(false);
  return (
    <form
      className="grid gap-1 p-1 m-a"
      onSubmit={handleSubmit((values) => {
        setInvalidCred(false);
        if (values.phone === "0123456" && values.password === "123456") {
          setUser({
            phone: "0123456",
            id: "123456",
            name: "Test Store",
          });
          navigate("/");
        } else {
          setInvalidCred(true);
        }
      })}
    >
      <h2>Sign In</h2>
      {invalidCred && <p className="error">Invalid credentials</p>}
      <Input label="Phone" {...register("phone")} />
      <Input label="Password" type="password" {...register("password")} />
      <button className="btn">Sign In</button>
    </form>
  );
};

export default Form;
