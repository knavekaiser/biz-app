import { authJwt, validate } from "../middlewares/index.js";
import * as controller from "../controllers/adSchema.controller.js";
import { adSchema as schema } from "../validationSchemas/index.js";

import express from "express";
const router = express.Router();

export default function (app) {
  router.get("/:id?", authJwt.verifyToken, controller.findAll);
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
  router.delete("/:id?", authJwt.verifyToken, controller.deleteSchema);

  app.use("/api/ad-schemas", router);
}
