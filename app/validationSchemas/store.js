const yup = require("yup");

module.exports = {
  create: yup.object({
    body: yup.object({
      start: yup.date().required(),
      end: yup.date().required(),
      category: yup.string().required(),
      business: yup.mixed().required(),
    }),
  }),
  update: yup.object({
    body: yup.object({
      start: yup.date().required(),
      end: yup.date().required(),
      category: yup.string().required(),
      business: yup.mixed().required(),
    }),
  }),
};
