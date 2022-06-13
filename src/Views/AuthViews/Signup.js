import { useContext } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import { Input } from "Components/elements";
import { useYup } from "hooks";
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
    reset,
    formState: { errors },
  } = useForm({
    resolver: useYup(validationSchema),
  });

  return (
    <form
      className="grid gap-2"
      handleSubmit={handleSubmit((values) => {
        setUser({
          id: Math.random().toString().substr(-8),
          name: values.name,
          phone: values.phone,
        });
      })}
    >
      <Input label="Phone" {...register("phone")} />
      <Input label="Name" {...register("name")} />
      <Input label="Password" type="password" {...register("password")} />
      <button>Sign Up</button>
    </form>
  );
};

export default Form;
