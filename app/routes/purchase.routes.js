const { authJwt, validate } = require("../middlewares");
const controller = require("../controllers/purchase.controller");
const { purchase: schema } = require("../validationSchemas");
var router = require("express").Router();

module.exports = function (app) {
  router.post(
    "/",
    authJwt.verifyToken,
    authJwt.checkPermission("purchase_create"),
    validate(schema.create),
    controller.create
  );
  router.put(
    "/:id",
    authJwt.verifyToken,
    authJwt.checkPermission("purchase_update"),
    validate(schema.update),
    controller.update
  );
  router.get(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("purchase_read"),
    controller.findAll
  );
  router.delete(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("purchase_delete"),
    controller.delete
  );

  app.use("/api/purchases", router);
};
