const { authJwt, validate, whitelabel } = require("../middlewares");
const controller = require("../controllers/chat.controller");
const { chat: schema } = require("../validationSchemas");
const router = require("express").Router();

module.exports = function (app) {
  router.get("/topics", whitelabel.getBusiness, controller.getTopics);
  router.get("/:_id", whitelabel.getBusinessOptinal, controller.getChat);
  router.post(
    "/",
    whitelabel.getBusinessOptinal,
    validate(schema.initChat),
    controller.initChat
  );
  router.post(
    "/:_id",
    whitelabel.getBusinessOptinal,
    validate(schema.sendMessage),
    controller.sendMessage
  );
  router.post("/:chat_id/:message_id", validate(schema.vote), controller.vote);

  app.use("/api/chat", router);
};