import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "Components/elements";
import { useYup, useFetch } from "hooks";
import { Prompt } from "Components/modal";
import * as yup from "yup";
import { endpoints } from "config";

const schema = yup.object({
  name: yup.string().required(),
  price: yup
    .number()
    .min(0, "Price Can't be less than 0")
    .required()
    .typeError("Please enter a valid number"),
  duration: yup
    .number()
    .min(1, "Please enter more than 0")
    .required()
    .typeError("Please enter a valid number"),
  maxProduct: yup
    .number()
    .min(1, "Please enter more than 0")
    .required()
    .typeError("Please enter a valid number"),
  maxAiChatToken: yup
    .number()
    .min(1, "Please enter more than 0")
    .required()
    .typeError("Please enter a valid number"),
  maxAiChatContextToken: yup
    .number()
    .min(1, "Please enter more than 0")
    .required()
    .typeError("Please enter a valid number"),
});

const Form = ({ edit, onSuccess }) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    resolver: useYup(schema),
  });

  const {
    post: save,
    put: update,
    loading,
  } = useFetch(endpoints.subPlans + `/${edit?._id || ""}`);

  useEffect(() => {
    reset({
      ...edit,
      maxProduct: edit?.features?.maxProduct,
      maxAiChatToken: edit?.features?.maxAiChatToken,
      maxAiChatContextToken: edit?.features?.maxAiChatContextToken,
    });
  }, [edit]);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        values.features = {
          maxProduct: values.maxProduct,
          maxAiChatToken: values.maxAiChatToken,
          maxAiChatContextToken: values.maxAiChatContextToken,
        };
        delete values.maxProduct;
        (edit ? update : save)({ ...values })
          .then(({ data }) => {
            if (!data.success) {
              return Prompt({ type: "error", message: data.message });
            }
            onSuccess(data.data);
          })
          .catch((err) => Prompt({ type: "error", message: err.message }));
      })}
      className={`grid gap-1 p-1`}
    >
      <Input label="Name" {...register("name")} required error={errors.name} />
      <Input
        label="Price"
        {...register("price")}
        type="number"
        required
        error={errors.price}
      />
      <Input
        label="Duration"
        {...register("duration")}
        type="number"
        required
        error={errors.duration}
      />
      <h3>Features</h3>
      <Input
        label="Max number of Products"
        {...register("maxProduct")}
        type="number"
        required
        error={errors.maxProduct}
      />
      <Input
        label="Max AI Chat Token"
        {...register("maxAiChatToken")}
        type="number"
        required
        error={errors.maxAiChatToken}
      />
      <Input
        label="Max AI Chat Context Token"
        {...register("maxAiChatContextToken")}
        type="number"
        required
        error={errors.maxAiChatContextToken}
      />
      <div className="btns">
        <button className="btn" disabled={loading}>
          {edit ? "Update" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default Form;
