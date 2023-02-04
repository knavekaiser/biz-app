import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input, Countdown } from "Components/elements";
import { Link, useNavigate } from "react-router-dom";
import { useYup, useFetch } from "hooks";
import { paths, endpoints } from "config";
import { Prompt } from "Components/modal";
import * as yup from "yup";
import s from "./auth.module.scss";

const otpSchema = yup.object({
  phone: yup.string().required("Required"),
});
const passwordResetSchema = yup.object({
  code: yup.string().required("Required"),
  password: yup
    .string()
    .min(8, "Password must be 8 characters or longer")
    .required("Required"),
  confirmPassword: yup
    .string()
    .required("Required")
    .oneOf([yup.ref("password")], "Password does not match"),
});

const Form = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState(null);
  const [timeout, setTimeout] = useState(null);
  const navigate = useNavigate();

  return (
    <>
      {step === 1 && (
        <SendOtpForm
          onSuccess={(otpDetail) => {
            setPhone(otpDetail.phone);
            setTimeout(otpDetail.timeout);
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <PasswordResetForm
          setPhone={setPhone}
          phone={phone}
          setStep={setStep}
          timeout={timeout}
          setTimeout={setTimeout}
          onSuccess={(resp) => {
            Prompt({
              type: "information",
              message: resp.message,
              callback: () => navigate(paths.signIn),
            });
          }}
        />
      )}
    </>
  );
};

const SendOtpForm = ({ onSuccess }) => {
  const { post: sendOtp, loading } = useFetch(endpoints.forgotPassword);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: useYup(otpSchema),
  });
  return (
    <form
      className="grid gap-1 p-1 m-a"
      onSubmit={handleSubmit((values) => {
        sendOtp({ phone: values.phone }).then(({ data }) => {
          if (data.success) {
            Prompt({
              type: "information",
              message: data.message,
            });
            onSuccess(data.data);
          } else {
            Prompt({
              type: "error",
              message: data.message,
            });
          }
        });
      })}
    >
      <img className={s.illustration} src="/assets/comify.png" />
      <div className={"grid gap-1"}>
        <h1 className="text-center">Comify Studio</h1>
        <h2>Reset Password</h2>
        <Input
          label="Phone"
          required
          {...register("phone")}
          error={errors.phone}
        />
        <button className="btn" disabled={loading}>
          Next
        </button>
        <Link to={paths.signIn}>Back to Login</Link>
      </div>
    </form>
  );
};

const PasswordResetForm = ({
  setPhone,
  phone,
  setStep,
  timeout,
  setTimeout,
  onSuccess,
}) => {
  const { post: resendOtp, loading: resendingOtp } = useFetch(
    endpoints.forgotPassword
  );
  const { post: resetPassword, loading: resettingPass } = useFetch(
    endpoints.resetPassword
  );
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({ resolver: useYup(passwordResetSchema) });
  useEffect(() => {
    if (!phone) {
      setStep(1);
    }
  }, [phone]);
  return (
    <form
      className="grid gap-1 p-1 m-a"
      onSubmit={handleSubmit((values) => {
        resetPassword({
          phone,
          password: values.password,
          code: values.code,
        }).then(({ data }) => {
          if (data.success) {
            onSuccess(data);
          } else {
            Prompt({
              type: "error",
              message: data.message,
            });
          }
        });
      })}
    >
      <img className={s.illustration} src="/assets/comify.png" />
      <div className={"grid gap-1"}>
        <h1 className="text-center">Comify</h1>
        <h2>Reset Password</h2>

        <p>Please enter the 6 digit code sent to {phone}.</p>

        <Input
          type="number"
          label="Code"
          required
          {...register("code")}
          error={errors.code}
        />
        <p className={s.resend}>
          Didn't recieve the Code?{" "}
          {timeout ? (
            <>
              Please wait{" "}
              <Countdown
                time={new Date().setSeconds(new Date().getSeconds() + timeout)}
                format={"mm:ss"}
                onEnd={() => setTimeout(null)}
              />
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                resendOtp({ phone }).then(({ data }) => {
                  if (data.success) {
                    setPhone(data.data.phone);
                    setTimeout(data.data.timeout);
                  } else {
                    Prompt({
                      type: "error",
                      message: data.message,
                    });
                  }
                });
              }}
              disabled={resendingOtp}
            >
              Resend
            </button>
          )}
        </p>

        <hr />

        <Input
          label="New Password"
          type="password"
          required
          {...register("password")}
          error={errors.password}
        />
        <Input
          label="Config Password"
          type="password"
          required
          {...register("confirmPassword")}
          error={errors.confirmPassword}
        />

        <button
          className="btn"
          type="submit"
          disabled={resendingOtp || resettingPass}
        >
          Submit
        </button>
        <Link to={paths.signIn}>Back to Login</Link>
      </div>
    </form>
  );
};

export default Form;
