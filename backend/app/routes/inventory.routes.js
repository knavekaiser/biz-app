import { authJwt, validate } from "../middlewares/index.js";
import * as controller from "../controllers/inventory.controller.js";
import { inventory as schema } from "../validationSchemas/index.js";

import express from "express";
const router = express.Router();

export default function (app) {
  router.get("/journals", authJwt.verifyToken, controller.getJournals);
  router.get("/masters", authJwt.verifyToken, controller.get);
  router.get("/listings", authJwt.verifyToken, controller.listing);
  router.get("/locations", authJwt.verifyToken, controller.locations);
  router.get(
    "/monthly-analysys",
    authJwt.verifyToken,
    controller.monthlyAnalysys
  );
  router.post(
    "/masters",
    authJwt.verifyToken,
    validate(schema.create),
    controller.create
  );
  router.put(
    "/masters/:id",
    authJwt.verifyToken,
    validate(schema.update),
    controller.update
  );
  router.delete(
    "/masters/:id",
    authJwt.verifyToken,
    validate(schema.delete),
    controller.remove
  );

  app.use("/api/inventory", router);
}
