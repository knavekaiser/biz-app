import { authJwt, validate } from "../middlewares/index.js";
import * as controller from "../controllers/quote.controller.js";
import { quote as schema } from "../validationSchemas/index.js";

import express from "express";
const router = express.Router();

export default function (app) {
  router.post(
    "/",
    authJwt.verifyToken,
    authJwt.checkPermission("quote_create"),
    validate(schema.create),
    controller.create
  );
  router.put(
    "/:id",
    authJwt.verifyToken,
    authJwt.checkPermission("quote_update"),
    validate(schema.update),
    controller.update
  );
  router.get(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("quote_read"),
    controller.findAll
  );
  router.delete(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("quote_delete"),
    controller.deleteQuote
  );

  app.use("/api/quotes", router);
}
