import { authJwt } from "../middlewares/index.js";
import * as controller from "../controllers/report.controller.js";

import express from "express";
const router = express.Router();

export default function (app) {
  router.get("/analytics", authJwt.verifyToken, controller.getAnalytics);

  router.get("/generate/:_id", authJwt.verifyToken, controller.genReport);

  router.get("/:_id?", authJwt.verifyToken, controller.getReports);
  router.post("/", authJwt.verifyToken, controller.createReport);
  router.put("/:_id", authJwt.verifyToken, controller.updateReport);
  router.delete("/:_id", authJwt.verifyToken, controller.deleteReport);

  app.use("/api/reports", router);
}
