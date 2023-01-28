const { authJwt, validate } = require("../middlewares");
const controller = require("../controllers/order.controller");
const { order: schema } = require("../validationSchemas");
var router = require("express").Router();

module.exports = function (app) {
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
  router.get("/:id?", authJwt.verifyToken, controller.findAll);
  router.delete("/:id?", authJwt.verifyToken, controller.delete);

  app.use("/api/orders", router);
};
