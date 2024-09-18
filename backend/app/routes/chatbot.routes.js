import { authJwt, validate, file, whitelabel } from "../middlewares/index.js";
import * as controller from "../controllers/chatbot.controller.js";
import { chatbot as schema } from "../validationSchemas/index.js";
import { appConfig } from "../config/index.js";

import express from "express";
const router = express.Router();
const routerPublic = express.Router();

export default function (app) {
  router.get("/", authJwt.verifyToken, controller.getChatbots);
  router.put(
    "/:_id",
    authJwt.verifyToken,
    file.upload([
      {
        name: "avatar",
        path: "/chatbot_avatars",
        fileSize: appConfig.supportedImageSizes,
        fileTypes: appConfig.supportedImageTypes,
      },
    ]),
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
}
