const { authJwt, validate, file, dynamic } = require("../middlewares");
const controller = require("../controllers/dynamic.controller");
// const { collection: schema } = require("../validationSchemas");
var router = require("express").Router();

module.exports = function (app) {
  router.post(
    "/:table",
    authJwt.verifyToken,
    file.dynamicUpload,
    dynamic.getModel,
    // validate(schema.create),
    controller.create
  );
  router.put(
    "/:table/:id",
    authJwt.verifyToken,
    file.dynamicUpload,
    dynamic.getModel,
    // validate(schema.update),
    controller.update
  );
  router.get(
    "/:table/:id?",
    authJwt.verifyToken,
    dynamic.getModel,
    controller.findAll
  );
  router.delete(
    "/:table/:id?",
    authJwt.verifyToken,
    dynamic.getModel,
    controller.delete
  );

  app.use("/api/dynamic", router);
};
