const { authJwt, validate } = require("../middlewares");
const controller = require("../controllers/invoice.controller");
const { invoice: schema } = require("../validationSchemas");
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

  app.use("/api/invoices", router);
};
