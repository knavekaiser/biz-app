import * as controller from "../controllers/common.controller.js";

import express from "express";
const router = express.Router();

export default function (app) {
  router.post("/webhooks/razorpay", controller.razorpayWebhook);

  app.use("/api", router);
}
