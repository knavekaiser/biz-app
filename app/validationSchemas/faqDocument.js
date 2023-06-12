const yup = require("yup");

module.exports = {
  create: yup.object({
    body: yup.object({
      topic: yup.string().required(),
      files: yup.array().of(yup.mixed()).typeError("files must be an array"),
      urls: yup
        .array()
        .of(yup.string().url())
        .typeError("urls must be an array"),
      description: yup.string(),
    }),
  }),
  update: yup.object({
    body: yup.object({
      topic: yup.string(),
      files: yup.array().of(yup.mixed()).typeError("files must be an array"),
      urls: yup
        .array()
        .of(yup.string().url())
        .typeError("urls must be an array"),
      description: yup.string(),
    }),
  }),
};
