import { authJwt, validate, file } from "../middlewares/index.js";
import * as controller from "../controllers/faqDocs.controller.js";
import { faqDocument as schema } from "../validationSchemas/index.js";
import { appConfig } from "../config/index.js";

import express from "express";
const router = express.Router();

export default function (app) {
  router.get(
    "/:_id?",
    authJwt.verifyToken,
    authJwt.checkPermission("faq_documents_read"),
    controller.findAll
  );
  router.post(
    "/",
    authJwt.verifyToken,
    authJwt.checkPermission("faq_documents_create"),
    file.upload([
      {
        name: "files",
        multiple: true,
        path: "/faq_documents",
        fileSize: appConfig.supportedFileSizes,
        fileTypes: appConfig.supportedFileTypes,
      },
    ]),
    validate(schema.create),
    controller.create
  );
  router.post(
    "/:_id/generate-user-context",
    authJwt.verifyToken,
    validate(schema.generateUserContext),
    controller.generateUserContext
  );
  router.put(
    "/:_id",
    authJwt.verifyToken,
    authJwt.checkPermission("faq_documents_update"),
    file.upload([
      {
        name: "files",
        multiple: true,
        path: "/faq_documents",
        fileSize: appConfig.supportedFileSizes,
        fileTypes: appConfig.supportedFileTypes,
      },
    ]),
    validate(schema.update),
    controller.update
  );
  router.delete(
    "/:_id?",
    authJwt.verifyToken,
    authJwt.checkPermission("faq_documents_delete"),
    controller.deleteDoc
  );

  app.use("/api/faq-documents", router);
}
