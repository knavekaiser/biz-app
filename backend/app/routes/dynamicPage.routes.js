import { authJwt, validate, file } from "../middlewares/index.js";
import * as controller from "../controllers/dynamicPage.controller.js";
import { dynamicPage as schema } from "../validationSchemas/index.js";
import { appConfig } from "../config/index.js";

import express from "express";
const router = express.Router();

export default function (app) {
  router.get(
    "/:_id?",
    authJwt.verifyToken,
    authJwt.checkPermission("dynamic_page_read"),
    controller.findAll
  );
  router.post(
    "/",
    authJwt.verifyToken,
    authJwt.checkPermission("dynamic_page_create"),
    file.uploadNew(
      [{ name: "files", multiple: true }, { name: "thumbnail" }],
      "/dynamic_pages",
      {
        fileSize: appConfig.supportedFileSizes,
        fileTypes: appConfig.supportedFileTypes,
      }
    ),
    validate(schema.create),
    controller.create
  );
  router.put(
    "/:_id",
    authJwt.verifyToken,
    authJwt.checkPermission("dynamic_page_update"),
    file.uploadNew([{ name: "files", multiple: true }], "/dynamic_page", {
      fileSize: appConfig.supportedFileSizes,
      fileTypes: appConfig.supportedFileTypes,
    }),
    validate(schema.update),
    controller.update
  );
  router.delete(
    "/:_id?",
    authJwt.verifyToken,
    authJwt.checkPermission("dynamic_page_delete"),
    controller.deletePage
  );

  app.use("/api/manage-dynamic-pages", router);
}
