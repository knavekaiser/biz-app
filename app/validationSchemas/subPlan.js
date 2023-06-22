const yup = require("yup");

module.exports = {
  create: yup.object({
    body: yup.object({
      name: yup.string().required(),
      price: yup.number().required(0),
      duration: yup.number().min(1).required(),
      features: yup.object({
        maxProduct: yup.number().min(1).required(),
        maxAiChatToken: yup.number().min(1).required(),
      }),
    }),
  }),
  update: yup.object({
    body: yup.object({
      name: yup.string().required(),
      price: yup.number().required(0),
      duration: yup.number().min(1).required(),
      features: yup.object({
        maxProduct: yup.number().min(1).required(),
        maxAiChatToken: yup.number().min(1).required(),
      }),
    }),
  }),
};
