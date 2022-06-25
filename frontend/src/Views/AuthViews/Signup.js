import { useContext } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import { Input } from "Components/elements";
import { Link, useNavigate } from "react-router-dom";
import { useYup, useFetch } from "hooks";
import { paths, endpoints } from "config";
import { Prompt } from "Components/modal";
import * as yup from "yup";

const validationSchema = yup.object({
  phone: yup.string().required("Required"),
  name: yup.string().required("Required"),
  password: yup.string().required("Required"),
});

const Form = () => {
  const { setUser } = useContext(SiteContext);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: useYup(validationSchema),
  });
  const { post: signup } = useFetch(endpoints.signUp);

  const navigate = useNavigate();
  return (
    <form
      className="grid gap-1 p-1 m-a"
      onSubmit={handleSubmit((values) => {
        signup({
          phone: values.phone,
          password: values.password,
          name: values.name,
        }).then(({ data }) => {
          if (data.success) {
            setUser(data.data);
            sessionStorage.setItem("access_token", data.token);
            navigate("/", { replace: true });
          } else {
            Prompt({
              type: "error",
              message: data.message,
            });
          }
        });
      })}
    >
      <h1 className="text-center">Cash App</h1>
      <br />
      <h2>Sign Up</h2>
      <Input
        label="Phone"
        required
        {...register("phone")}
        error={errors.phone}
      />
      <Input
        label="Business Name"
        required
        {...register("name")}
        error={errors.name}
      />
      <Input
        label="Password"
        required
        type="password"
        {...register("password")}
        error={errors.password}
      />
      <button className="btn">Sign Up</button>
      <Link to={paths.signIn}>Already have an account</Link>
    </form>
  );
};

export default Form;
