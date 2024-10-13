import { authJwt, validate } from "../middlewares/index.js";
import * as controller from "../controllers/inventoryBranch.controller.js";
import { inventoryBranch as schema } from "../validationSchemas/index.js";

import express from "express";
const router = express.Router();

export default function (app) {
  router.get("/", authJwt.verifyToken, controller.get);
  router.post(
    "/",
    authJwt.verifyToken,
    validate(schema.create),
    controller.create
  );
  router.put(
    "/:id",
    authJwt.verifyToken,
    validate(schema.update),
    controller.update
  );
  router.delete(
    "/:id",
    authJwt.verifyToken,
    // validate(schema.remove),
    controller.remove
  );

  app.use("/api/inventory-branches", router);
}
