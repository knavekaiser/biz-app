import { authJwt, validate } from "../middlewares/index.js";
import * as controller from "../controllers/purchaseReturn.controller.js";
import { purchase as schema } from "../validationSchemas/index.js";

import express from "express";
const router = express.Router();

export default function (app) {
  router.post(
    "/",
    authJwt.verifyToken,
    authJwt.checkPermission("purchase_return_create"),
    validate(schema.create),
    controller.create
  );
  router.put(
    "/:id",
    authJwt.verifyToken,
    authJwt.checkPermission("purchase_return_update"),
    validate(schema.update),
    controller.update
  );
  router.get(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("purchase_return_read"),
    controller.findAll
  );
  router.delete(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("purchase_return_delete"),
    controller.deletePruchase
  );

  app.use("/api/purchase-returns", router);
}
