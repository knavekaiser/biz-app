const { authJwt, validate } = require("../middlewares");
const controller = require("../controllers/category.controller");
const { category: schema } = require("../validationSchemas");
var router = require("express").Router();

module.exports = function (app) {
  router.get(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("category_read"),
    controller.findAll
  );
  router.post(
    "/",
    authJwt.verifyToken,
    authJwt.checkPermission("category_create"),
    validate(schema.create),
    controller.create
  );
  router.put(
    "/:id",
    authJwt.verifyToken,
    authJwt.checkPermission("category_update"),
    validate(schema.update),
    controller.update
  );
  router.delete(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("category_delete"),
    controller.delete
  );

  app.use("/api/categories", router);
};
