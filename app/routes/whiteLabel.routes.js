const { authJwt, validate } = require("../middlewares");
const controller = require("../controllers/whiteLabel.controller");
// const { collection: schema } = require("../validationSchemas");
var router = require("express").Router();

module.exports = function (app) {
  router.get("/site-config", controller.getData);
  router.get("/browse/:_id?", controller.browse);

  app.use("/api", router);
};
