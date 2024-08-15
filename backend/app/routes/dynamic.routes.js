import { authJwt, validate, file, dynamic } from "../middlewares/index.js";
import * as controller from "../controllers/dynamic.controller.js";
// const { collection as schema } from "../validationSchemas/index.js";

import express from "express";
const router = express.Router();

export default function (app) {
  router.post(
    "/:table/bulk-create",
    authJwt.verifyToken,
    dynamic.getModel,
    file.dynamicUpload,
    // validate(schema.create),
    controller.bulkCreate
  );
  router.post(
    "/:table",
    authJwt.verifyToken,
    dynamic.getModel,
    file.dynamicUpload,
    // validate(schema.create),
    controller.create
  );
  router.put(
    "/:table/:id",
    authJwt.verifyToken,
    dynamic.getModel,
    file.dynamicUpload,
    // validate(schema.update),
    controller.update
  );
  router.get(
    "/:table/:id?",
    authJwt.verifyToken,
    dynamic.getModel,
    controller.findAll
  );
  router.delete(
    "/:table/:id?",
    authJwt.verifyToken,
    dynamic.getModel,
    file.removeFiles,
    controller.deleteColl
  );

  app.use("/api/dynamic", router);
}
