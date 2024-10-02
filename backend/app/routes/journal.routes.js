import { authJwt, validate } from "../middlewares/index.js";
import * as controller from "../controllers/journal.controller.js";
import { journal as schema } from "../validationSchemas/index.js";

import express from "express";
const router = express.Router();

export default function (app) {
  router.post(
    "/",
    authJwt.verifyToken,
    authJwt.checkPermission("journal_create"),
    validate(schema.create),
    controller.create
  );
  router.put(
    "/:_id",
    authJwt.verifyToken,
    authJwt.checkPermission("journal_update"),
    validate(schema.update),
    controller.update
  );
  router.get(
    "/:_id?",
    authJwt.verifyToken,
    authJwt.checkPermission("journal_read"),
    controller.findAll
  );
  router.delete(
    "/:_id?",
    authJwt.verifyToken,
    authJwt.checkPermission("journal_delete"),
    controller.deleteEntry
  );

  app.use("/api/journals", router);
}
