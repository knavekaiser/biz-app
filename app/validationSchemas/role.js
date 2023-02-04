const yup = require("yup");
const commonYup = require("./commonYup");

module.exports = {
  create: yup.object({
    body: yup.object({
      name: yup.string().required(),
      permissions: yup
        .array()
        .of(yup.string().required())
        .required()
        .typeError("items must be an array"),
    }),
  }),
  update: yup.object({
    body: yup.object({
      name: yup.string().required(),
      permissions: yup
        .array()
        .of(yup.string().required())
        .required()
        .typeError("items must be an array"),
    }),
  }),
};
