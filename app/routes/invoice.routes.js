const { authJwt, validate } = require("../middlewares");
const controller = require("../controllers/invoice.controller");
const { invoice: schema } = require("../validationSchemas");
var router = require("express").Router();

module.exports = function (app) {
  router.post(
    "/",
    authJwt.verifyToken,
    authJwt.checkPermission("invoice_create"),
    validate(schema.create),
    controller.create
  );
  router.put(
    "/:id",
    authJwt.verifyToken,
    authJwt.checkPermission("invoice_update"),
    validate(schema.update),
    controller.update
  );
  router.get(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("invoice_read"),
    controller.findAll
  );
  router.delete(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("invoice_delete"),
    controller.delete
  );

  app.use("/api/invoices", router);
};
