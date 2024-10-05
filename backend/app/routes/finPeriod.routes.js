import { authJwt, validate } from "../middlewares/index.js";
import * as controller from "../controllers/finPeriod.controller.js";
import { finPeriod as schema } from "../validationSchemas/index.js";

import express from "express";
const router = express.Router();

export default function (app) {
  router.post(
    "/",
    authJwt.verifyToken,
    authJwt.checkPermission(),
    validate(schema.create),
    controller.create
  );
  router.put(
    "/:_id",
    authJwt.verifyToken,
    authJwt.checkPermission(),
    validate(schema.update),
    controller.update
  );
  router.get(
    "/",
    authJwt.verifyToken,
    authJwt.checkPermission(),
    controller.find
  );
  router.delete(
    "/:_id?",
    authJwt.verifyToken,
    authJwt.checkPermission(),
    controller.remove
  );

  app.use("/api/financial-periods", router);
}
