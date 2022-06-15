import { useState, useContext } from "react";
import { SiteContext } from "SiteContext";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "Components/elements";
import { useYup } from "hooks";
import { paths } from "config";
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
            name: "Small Business",
            moto: "Shop at your fingertips",
            phone: "915874515451",
            email: "smallbusiness@gmail.com",
            address: "1/7 abby road, kamalpur, UP, India",
            bankDetail: {
              bankName: "National Bank",
              branch: "Tempa",
              accNo: "201452454545",
              accName: "Small Business",
            },
            owner: {
              name: "Mr. Anderson",
              phone: "0123456",
              email: "anderson@email.com",
              signature:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Signature_of_Ann_Miller.svg/800px-Signature_of_Ann_Miller.svg.png",
            },
            logo:
              "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/BMW_logo_%28gray%29.svg/2048px-BMW_logo_%28gray%29.svg.png",
            gstin: "545455454545",
            pan: "9871456456454212",
            ifsc: "54515154545",
            terms: ["TDS as applicable", "Payment 30-days form the invoice"],
          });
          navigate("/");
        } else {
          setInvalidCred(true);
        }
      })}
    >
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
      <button className="btn">Sign In</button>
      <Link to={paths.signUp}>Create New Account</Link>
    </form>
  );
};

export default Form;
