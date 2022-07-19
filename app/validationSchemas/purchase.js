const yup = require("yup");
const commonYup = require("./commonYup");

module.exports = {
  create: yup.object({
    body: yup.object({
      dateTime: yup.string().required(),
      gst: yup.number().min(0).required(),
      items: yup
        .array()
        .of(
          yup.object().shape({
            name: yup.string().required(),
            price: yup.number().min(0).required(),
            qty: yup.number().min(0).required(),
            unit: yup.string().required(),
          })
        )
        .min(1)
        .required()
        .typeError("items must be an array"),
      vendor: yup.object().shape({
        name: yup.string().required(),
        detail: yup.string().required(),
      }),
    }),
  }),
  update: yup.object({
    body: yup.object({
      dateTime: yup.string().required(),
      gst: yup.number().min(0).required(),
      items: yup
        .array()
        .of(
          yup.object().shape({
            name: yup.string().required(),
            price: yup.number().min(0).required(),
            qty: yup.number().min(0).required(),
            unit: yup.string().required(),
          })
        )
        .min(1)
        .required(),
      vendor: yup.object().shape({
        name: yup.string().required(),
        detail: yup.string().required(),
      }),
    }),
  }),
};
