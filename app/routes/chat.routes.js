const { authJwt, validate, whitelabel } = require("../middlewares");
const controller = require("../controllers/chat.controller");
const { chat: schema } = require("../validationSchemas");
const router = require("express").Router();
const adminRouter = require("express").Router();

module.exports = function (app) {
  router.get(
    "/topics",
    // whitelabel.getBusiness,
    authJwt.verifyOrigin,
    controller.getTopics
  );
  router.get(
    "/:_id",
    // whitelabel.getBusinessOptinal,
    authJwt.verifyOrigin,
    controller.getChat
  );
  router.post(
    "/",
    // whitelabel.getBusinessOptinal,
    validate(schema.initChat),
    authJwt.verifyOrigin,
    controller.initChat
  );
  router.post(
    "/:_id",
    // whitelabel.getBusinessOptinal,
    authJwt.verifyOrigin,
    validate(schema.sendMessage),
    controller.sendMessage
  );
  router.post(
    "/:chat_id/:message_id",
    authJwt.verifyOrigin,
    validate(schema.vote),
    controller.vote
  );

  app.use("/api/chat", router);

  // ------------------------------------------ Management
  adminRouter.get(
    "/:_id?",
    authJwt.verifyToken,
    authJwt.checkPermission("chat_read"),
    controller.getChats
  );
  adminRouter.delete(
    "/:_id",
    authJwt.verifyToken,
    authJwt.checkPermission("chat_delete"),
    controller.delete
  );
  app.use("/api/chats", adminRouter);
};
