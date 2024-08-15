import { authJwt, validate, whitelabel } from "../middlewares/index.js";
import * as controller from "../controllers/chat.controller.js";
import { chat as schema } from "../validationSchemas/index.js";

import express from "express";
const router = express.Router();
const adminRouter = express.Router();

export default function (app) {
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
    whitelabel.getBusinessOptinal,
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
    controller.deleteChat
  );
  app.use("/api/chats", adminRouter);
}
