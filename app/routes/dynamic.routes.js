const { authJwt, validate, file, dynamic } = require("../middlewares");
const controller = require("../controllers/dynamic.controller");
// const { collection: schema } = require("../validationSchemas");
const router = require("express").Router();
const commonRouter = require("express").Router();

module.exports = function (app) {
  router.post(
    "/:table/bulk-create",
    authJwt.verifyToken,
    dynamic.getModel,
    file.dynamicUpload,
    // validate(schema.create),
    controller.bulkCreate
  );
  router.post(
    "/:table",
    authJwt.verifyToken,
    dynamic.getModel,
    file.dynamicUpload,
    // validate(schema.create),
    controller.create
  );
  router.put(
    "/:table/:id",
    authJwt.verifyToken,
    dynamic.getModel,
    file.dynamicUpload,
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
    file.removeFiles,
    controller.delete
  );

  app.use("/api/dynamic", router);

  // -------------------------------------------------------

  commonRouter.get(
    "/:table/:id?",
    authJwt.verifyToken,
    dynamic.getCommonModel,
    controller.findCommonCollection
  );
  app.use("/api/common-collection", commonRouter);
};
