const yup = require("yup");

module.exports = {
  create: yup.object({
    body: yup.object({
      category: yup.string().required(),
      name: yup.string().required(),
    }),
  }),
  update: yup.object({
    body: yup.object({
      category: yup.string().required(),
      name: yup.string().required(),
    }),
  }),
};
