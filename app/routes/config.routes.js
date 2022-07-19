const { authJwt, validate } = require("../middlewares");
const controller = require("../controllers/config.controller");
const { config: schema } = require("../validationSchemas");
var router = require("express").Router();

module.exports = function (app) {
  router.put(
    "/",
    authJwt.verifyToken,
    validate(schema.update),
    controller.update
  );
  router.get("/", authJwt.verifyToken, controller.findOne);

  app.use("/api/user-config", router);
};
