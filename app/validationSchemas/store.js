const yup = require("yup");
const commonYup = require("./commonYup");

module.exports = {
  create: yup.object({
    body: yup.object({
      name: yup.string().required(),
      business: yup.mixed().required(),
    }),
  }),
  update: yup.object({
    body: yup.object({
      name: yup.string().required(),
      business: yup.mixed().required(),
    }),
  }),
};
