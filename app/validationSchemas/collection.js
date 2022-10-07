const yup = require("yup");
const commonYup = require("./commonYup");

const fieldSchema = yup.object().shape({
  name: yup.string().required(),
  dataType: yup.string().required(),
  label: yup.string().required(),
  fieldType: yup.string(),
  inputType: yup.string(),
  required: yup.boolean().required(),
  // options for select and radio
});

module.exports = {
  create: yup.object({
    body: yup.object({
      name: yup.string().required(),
      fields: yup
        .array()
        .of(fieldSchema)
        .min(1)
        .required()
        .typeError("items must be an array"),
    }),
  }),
  update: yup.object({
    body: yup.object({
      name: yup.string().required(),
      fields: yup
        .array()
        .of(fieldSchema)
        .min(1)
        .required()
        .typeError("items must be an array"),
    }),
  }),
};
