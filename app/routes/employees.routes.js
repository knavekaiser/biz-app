import { authJwt, validate } from "../middlewares/index.js";
import * as controller from "../controllers/employee.controller.js";
import { employee as schema } from "../validationSchemas/index.js";

import express from "express";
const router = express.Router();

export default function (app) {
  router.put(
    "/",
    authJwt.verifyToken,
    authJwt.checkPermission("employee_update"),
    validate(schema.update),
    controller.update
  );
  router.get(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("employee_read"),
    controller.findAll
  );

  app.use("/api/employees", router);
}
