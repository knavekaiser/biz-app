const { authJwt, validate, file, dynamic } = require("../middlewares");
const controller = require("../controllers/adminDynamic.controller");
// const { collection: schema } = require("../validationSchemas");
const router = require("express").Router();

module.exports = function (app) {
  router.post(
    "/:table/bulk-create",
    authJwt.verifyToken,
    dynamic.getAdminModel,
    file.dynamicUpload,
    // validate(schema.create),
    controller.bulkCreate
  );
  router.post(
    "/:table",
    authJwt.verifyToken,
    dynamic.getAdminModel,
    file.dynamicUpload,
    // validate(schema.create),
    controller.create
  );
  router.put(
    "/:table/:id",
    authJwt.verifyToken,
    dynamic.getAdminModel,
    file.dynamicUpload,
    // validate(schema.update),
    controller.update
  );
  router.get(
    "/:table/:id?",
    authJwt.verifyToken,
    dynamic.getAdminModel,
    controller.findAll
  );
  router.delete(
    "/:table/:id?",
    authJwt.verifyToken,
    dynamic.getAdminModel,
    file.removeFiles,
    controller.delete
  );

  app.use("/api/admin/dynamic", router);
};
