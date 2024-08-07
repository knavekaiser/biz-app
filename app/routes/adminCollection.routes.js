import { authJwt, validate } from "../middlewares/index.js";
import * as controller from "../controllers/adminCollection.controller.js";
import { collection as schema } from "../validationSchemas/index.js";

import express from "express";
const router = express.Router();

export default function (app) {
  router.get("/templates", authJwt.verifyToken, controller.getSchemaTemplates);
  router.post(
    "/templates",
    authJwt.verifyToken,
    validate(schema.addSchemaTemplate),
    controller.addSchemaTemplates
  );

  router.post(
    "/",
    authJwt.verifyToken,
    authJwt.checkPermission("dynamic_table_create"),
    validate(schema.create),
    controller.create
  );
  router.put(
    "/:id",
    authJwt.verifyToken,
    authJwt.checkPermission("dynamic_table_update"),
    validate(schema.update),
    controller.update
  );
  router.get(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("dynamic_table_read"),
    controller.findAll
  );
  router.delete(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("dynamic_table_delete"),
    controller.deleteColl
  );

  app.use("/api/admin/collections", router);
}
