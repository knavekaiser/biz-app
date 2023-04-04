const { authJwt, validate } = require("../middlewares");
const controller = require("../controllers/adSchema.controller");
const { adSchema: schema } = require("../validationSchemas");
var router = require("express").Router();

module.exports = function (app) {
  router.get("/:id?", authJwt.verifyToken, controller.findAll);
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
  router.delete("/:id?", authJwt.verifyToken, controller.delete);

  app.use("/api/ad-schemas", router);
};
