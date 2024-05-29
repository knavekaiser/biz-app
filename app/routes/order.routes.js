import { authJwt, validate } from "../middlewares/index.js";
import * as controller from "../controllers/order.controller.js";
import { order as schema } from "../validationSchemas/index.js";

import express from "express";
const router = express.Router();

export default function (app) {
  router.post(
    "/",
    authJwt.verifyToken,
    authJwt.checkPermission("order_create"),
    validate(schema.create),
    controller.create
  );
  router.put(
    "/:id",
    authJwt.verifyToken,
    authJwt.checkPermission("order_update"),
    validate(schema.update),
    controller.update
  );
  router.get(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("order_read"),
    controller.findAll
  );
  router.delete(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("order_delete"),
    controller.deleteOrder
  );

  router.post(
    "/generate-from-quote",
    authJwt.verifyToken,
    authJwt.checkPermission("order_create"),
    validate(schema.generateFromQuote),
    controller.generateFromQuote
  );

  app.use("/api/orders", router);
}
