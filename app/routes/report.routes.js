const { authJwt } = require("../middlewares");
const controller = require("../controllers/report.controller");
var router = require("express").Router();

module.exports = function (app) {
  router.get("/analytics", authJwt.verifyToken, controller.getAnalytics);

  app.use("/api/reports", router);
};
