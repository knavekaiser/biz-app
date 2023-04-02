const yup = require("yup");

module.exports = {
  create: yup.object({ body: yup.object({ name: yup.string().required() }) }),
  update: yup.object({ body: yup.object({ name: yup.string().required() }) }),
};
