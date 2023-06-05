const yup = require("yup");

module.exports = {
  initChat: yup.object({
    body: yup.object({
      topic: yup.string().max(60).required(), // check if the doc exists
      name: yup.string().max(60).required(),
      email: yup.string().max(150).email().required(),
      message: yup.string().max(250).required(),
    }),
  }),
  sendMessage: yup.object({
    body: yup.object({
      content: yup.string().max(250).required(),
    }),
    params: yup.object({
      _id: yup.string().required(), // check if the chat exists
    }),
  }),
};
