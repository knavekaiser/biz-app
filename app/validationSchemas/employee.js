const yup = require("yup");
const commonYup = require("./commonYup");

module.exports = {
  update: yup.object({
    body: yup.object({
      employee: yup.string().required(),
      roles: yup.array().of(yup.string()).required(),
    }),
  }),
};
