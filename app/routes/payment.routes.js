const { authJwt, validate } = require("../middlewares");
const controller = require("../controllers/payment.controller");
const { payment: schema } = require("../validationSchemas");
var router = require("express").Router();

module.exports = function (app) {
  router.post(
    "/",
    authJwt.verifyToken,
    authJwt.checkPermission("payment_create"),
    validate(schema.create),
    controller.create
  );
  router.put(
    "/:id",
    authJwt.verifyToken,
    authJwt.checkPermission("payment_update"),
    validate(schema.update),
    controller.update
  );
  router.get(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("payment_read"),
    controller.findAll
  );
  router.delete(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("payment_delete"),
    controller.delete
  );

  app.use("/api/payments", router);
};
