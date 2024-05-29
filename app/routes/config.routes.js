import { authJwt, validate, file } from "../middlewares/index.js";
import { appConfig } from "../config/index.js";
import * as controller from "../controllers/config.controller.js";
import { config as schema } from "../validationSchemas/index.js";

import express from "express";
const router = express.Router();

export default function (app) {
  router.put(
    "/",
    authJwt.verifyToken,
    file.upload(
      [
        { name: "siteConfig.landingPage.hero.slides", multiple: true },
        { name: "dynamicPageFiles", multiple: true },
      ],
      "/",
      {
        fileSize: appConfig.supportedImageSizes,
        fileTypes: appConfig.supportedImageTypes,
        override: true,
      }
    ),
    validate(schema.update),
    controller.update
  );
  router.get("/", authJwt.verifyToken, controller.findOne);

  app.use("/api/user-config", router);
}
