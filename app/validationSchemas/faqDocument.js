const yup = require("yup");

module.exports = {
  create: yup.object({
    body: yup.object({
      topic: yup.string().required(),
      files: yup
        .array()
        .of(yup.mixed())
        .min(1)
        .required()
        .typeError("items must be an array"),
      description: yup.string(),
    }),
  }),
  update: yup.object({
    body: yup.object({
      topic: yup.string(),
      files: yup
        .array()
        .of(yup.mixed())
        .min(1)
        .typeError("items must be an array"),
      description: yup.string(),
    }),
  }),
};
