const { authJwt, validate, file, whitelabel } = require("../middlewares");
const controller = require("../controllers/chatbot.controller");
const { chatbot: schema } = require("../validationSchemas");
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
    validate(schema.update),
    controller.updateChatbot
  );

  app.use("/api/chatbots", router);

  // ---------------------------------- Public
  routerPublic.get(
    "/get-chatbot/by-domain/:domain",
    // authJwt.verifyOrigin,
    controller.getChatbotByDomain
  );
  routerPublic.get(
    "/get-chatbot",
    whitelabel.getBusinessOptinal,
    // authJwt.verifyOrigin,
    controller.getChatbot
  );
  app.use("/api", routerPublic);
};
