const { authJwt, validate, file } = require("../middlewares");
const controller = require("../controllers/dynamic.controller");
// const { collection: schema } = require("../validationSchemas");
var router = require("express").Router();

module.exports = function (app) {
  router.post(
    "/:table",
    authJwt.verifyToken,
    file.dynamicUpload,
    // validate(schema.create),
    controller.create
  );
  router.put(
    "/:table/:id",
    authJwt.verifyToken,
    file.dynamicUpload,
    // validate(schema.update),
    controller.update
  );
  router.get("/:table/:id?", authJwt.verifyToken, controller.findAll);
  router.delete("/:table/:id?", authJwt.verifyToken, controller.delete);

  app.use("/api/dynamic", router);
};
