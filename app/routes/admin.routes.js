import { authJwt, file, validate } from "../middlewares/index.js";
import { appConfig } from "../config/index.js";
import * as controller from "../controllers/admin.controller.js";
import { users as schema } from "../validationSchemas/index.js";

import express from "express";
const router = express.Router();

export default function (app) {
  //-------------------------- Auth
  router.post("/signup", validate(schema.signup), controller.signup);
  router.post("/signin", validate(schema.login), controller.login);
  router.post(
    "/forgot-password",
    validate(schema.forgotPassword),
    controller.forgotPassword
  );
  router.post(
    "/reset-password",
    validate(schema.resetPassword),
    controller.resetPassword
  );
  router.post("/logout", controller.logout);

  //-------------------------- Profile
  router.get("/profile", authJwt.verifyToken, controller.profile);
  router.put(
    "/profile",
    authJwt.verifyToken,
    file.upload(
      [{ name: "logo" }, { name: "ownerSignature" }, { name: "favicon" }],
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

  app.use("/api/admin", router);
}
