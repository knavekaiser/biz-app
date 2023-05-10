const yup = require("yup");
const commonYup = require("./commonYup");

module.exports = {
  create: yup.object({
    body: yup.object({
      name: yup.string().required(),
      price: yup.number().required(0),
      duration: yup.number().min(1).required(),
    }),
  }),
  update: yup.object({
    body: yup.object({
      name: yup.string().required(),
      price: yup.number().required(0),
      duration: yup.number().min(1).required(),
    }),
  }),
};
