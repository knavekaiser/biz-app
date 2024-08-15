import { authJwt } from "../middlewares/index.js";
import * as controller from "../controllers/report.controller.js";

import express from "express";
const router = express.Router();

export default function (app) {
  router.get("/analytics", authJwt.verifyToken, controller.getAnalytics);

  app.use("/api/reports", router);
}
