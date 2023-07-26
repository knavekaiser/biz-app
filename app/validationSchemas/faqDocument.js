const yup = require("yup");
const { FaqDoc } = require("../models");

module.exports = {
  create: yup.object({
    body: yup.object({
      topic: yup.string().required(),
      files: yup.array().of(yup.mixed()).typeError("files must be an array"),
      urls: yup
        .array()
        .of(yup.string().url())
        .typeError("urls must be an array"),
      contextForUsers: yup.string().max(200),
      description: yup.string().max(200),
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
      contextForUsers: yup.string().max(200),
      description: yup.string().max(200),
    }),
  }),
  generateUserContext: yup.object({
    body: yup.object({
      prompt: yup.string().max(300).required(),
    }),
    params: yup.object({
      _id: yup
        .string()
        .objectId()
        .test("check", "Topic not found", (v) => FaqDoc.findOne({ _id: v }))
        .required(),
    }),
  }),
};
