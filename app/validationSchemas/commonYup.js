const yup = require("yup");

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
