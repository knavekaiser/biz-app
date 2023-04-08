const yup = require("yup");

module.exports = {
  create: yup.object({
    body: yup.object({
      startDate: yup.date().required(),
      endDate: yup.date().required(),
      category: yup.string().required(),
      business: yup.mixed().required(),
    }),
  }),
  update: yup.object({
    body: yup.object({
      startDate: yup.date().required(),
      endDate: yup.date().required(),
      category: yup.string().required(),
      business: yup.mixed().required(),
    }),
  }),
};
