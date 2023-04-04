const { authJwt, validate } = require("../middlewares");
const controller = require("../controllers/adminCollection.controller");
const { collection: schema } = require("../validationSchemas");
const router = require("express").Router();

module.exports = function (app) {
  router.get("/templates", authJwt.verifyToken, controller.getSchemaTemplates);
  router.post(
    "/templates",
    authJwt.verifyToken,
    validate(schema.addSchemaTemplate),
    controller.addSchemaTemplates
  );

  router.post(
    "/",
    authJwt.verifyToken,
    authJwt.checkPermission("dynamic_table_create"),
    validate(schema.create),
    controller.create
  );
  router.put(
    "/:id",
    authJwt.verifyToken,
    authJwt.checkPermission("dynamic_table_update"),
    validate(schema.update),
    controller.update
  );
  router.get(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("dynamic_table_read"),
    controller.findAll
  );
  router.delete(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("dynamic_table_delete"),
    controller.delete
  );

  app.use("/api/admin/collections", router);
};
