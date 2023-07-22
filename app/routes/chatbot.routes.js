const { authJwt, validate, file } = require("../middlewares");
const controller = require("../controllers/chatbot.controller");
const { chat: schema } = require("../validationSchemas");
const { appConfig } = require("../config");
const router = require("express").Router();
const routerPublic = require("express").Router();

module.exports = function (app) {
  router.get("/", authJwt.verifyToken, controller.getChatbots);
  router.put(
    "/:_id",
    authJwt.verifyToken,
    file.uploadNew({ name: "avatar" }, "/chatbot_avatars", {
      fileSize: appConfig.supportedImageSizes,
      fileTypes: appConfig.supportedImageTypes,
    }),
    // validate(schema.sendMessage),
    controller.updateChatbot
  );

  app.use("/api/chatbots", router);

  // ---------------------------------- Public
  routerPublic.get(
    "/get-chatbot/:chatbot_id",
    authJwt.verifyOrigin,
    controller.getChatbot
  );
  app.use("/api", routerPublic);
};
