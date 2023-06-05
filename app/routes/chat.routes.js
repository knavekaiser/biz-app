const { authJwt, validate, whitelabel } = require("../middlewares");
const controller = require("../controllers/chat.controller");
const { chat: schema } = require("../validationSchemas");
const router = require("express").Router();

module.exports = function (app) {
  router.get("/topics", whitelabel.getBusiness, controller.getTopics);
  router.get("/:_id", whitelabel.getBusiness, controller.getChat);
  router.post(
    "/",
    whitelabel.getBusiness,
    validate(schema.initChat),
    controller.initChat
  );
  router.post(
    "/:_id",
    whitelabel.getBusiness,
    validate(schema.sendMessage),
    controller.sendMessage
  );

  router.get(
    "/messages",
    //   authJwt.verifyToken,
    controller.getMessages
  );
  router.post(
    "/messages",
    // authJwt.verifyToken,
    // validate(schema.addSchemaTemplate),
    controller.postMessage
  );

  app.use("/api/chat", router);
};
