const yup = require("yup");
const { FaqDoc, Chat } = require("../models");

module.exports = {
  initChat: yup.object({
    body: yup.object({
      url: yup.string().url(),
      topic: yup
        .string()
        .max(60)
        .test("checkTopic", "Topic not found", (v) =>
          v ? FaqDoc.findOne({ topic: v }) : true
        ),
      name: yup.string().max(60).required(),
      email: yup.string().max(150).email().required(),
      message: yup
        .string()
        .trim()
        .max(250, "Message must be less than 250 characters long")
        .required(),
    }),
  }),
  sendMessage: yup.object({
    body: yup.object({
      content: yup
        .string()
        .trim()
        .max(250, "Message must be less than 250 characters long")
        .required(),
    }),
    params: yup.object({
      _id: yup
        .string()
        .required()
        .test("checkChat", "Chat does not exist", (v) =>
          Chat.findOne({ _id: v })
        ),
    }),
  }),
  vote: yup.object({
    body: yup.object({
      like: yup.mixed().oneOf([true, false, null]).nullable(),
    }),
    params: yup.object({
      chat_id: yup
        .string()
        .required()
        .test("checkChat", "Chat does not exist", (v) =>
          Chat.findOne({ _id: v })
        ),
      message_id: yup.string().required(), // check if the chat exists
    }),
  }),
};
