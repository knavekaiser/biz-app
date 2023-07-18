const { authJwt, validate, file } = require("../middlewares");
const controller = require("../controllers/dynamicPage.controller");
const { dynamicPage: schema } = require("../validationSchemas");
const { appConfig } = require("../config");
const router = require("express").Router();

module.exports = function (app) {
  router.get(
    "/:_id?",
    authJwt.verifyToken,
    authJwt.checkPermission("dynamic_page_read"),
    controller.findAll
  );
  router.post(
    "/",
    authJwt.verifyToken,
    authJwt.checkPermission("dynamic_page_create"),
    file.uploadNew(
      [{ name: "files", multiple: true }, { name: "thumbnail" }],
      "/dynamic_pages",
      {
        fileSize: appConfig.supportedFileSizes,
        fileTypes: appConfig.supportedFileTypes,
      }
    ),
    validate(schema.create),
    controller.create
  );
  router.put(
    "/:_id",
    authJwt.verifyToken,
    authJwt.checkPermission("dynamic_page_update"),
    file.uploadNew([{ name: "files", multiple: true }], "/dynamic_page", {
      fileSize: appConfig.supportedFileSizes,
      fileTypes: appConfig.supportedFileTypes,
    }),
    validate(schema.update),
    controller.update
  );
  router.delete(
    "/:_id?",
    authJwt.verifyToken,
    authJwt.checkPermission("dynamic_page_delete"),
    controller.delete
  );

  app.use("/api/manage-dynamic-pages", router);
};
