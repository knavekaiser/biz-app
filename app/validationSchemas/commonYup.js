const yup = require("yup");
const { phone } = require("phone");

module.exports = {
  location: {
    latitude: yup
      .number()
      .min(-90)
      .max(90)
      .required()
      .typeError("Invalid latitude"),
    longitude: yup
      .number()
      .min(-180)
      .max(180)
      .required()
      .typeError("Invalid longitude"),
  },
  pin: yup.string().matches(/^\d{4}$/, "Pin must be 4 digits"),
  password: yup.string().min(8),
  amount: yup.number().typeError("Invalid amount").min(1),
};

yup.addMethod(yup.string, "noneOf", function (arr, message) {
  return this.test("noneOf", message, function (value) {
    const { path, createError } = this;
    return (
      !arr.includes(value) ||
      createError({
        path,
        message: message?.replace(`{value}`, value) || message,
      })
    );
  });
});

yup.addMethod(yup.string, "phone", function (
  message = "Phone number is invalid. Make sure to include country code"
) {
  return this.test("phone", message, function (value) {
    const { path, createError } = this;
    return (
      !value ||
      phone(value)?.isValid ||
      createError({
        path,
        message,
      })
    );
  });
});

yup.addMethod(yup.string, "objectId", function (message) {
  return this.test("phone", message, function (value) {
    const { path, createError } = this;
    return (
      !value ||
      mongoose.isValidObjectId(value) ||
      createError({
        path,
        message: message || `"${value}" is not a valid ObjectId`,
      })
    );
  });
});
