const { authJwt, validate, file } = require("../middlewares");
const controller = require("../controllers/faqDocs.controller");
const { faqDocument: schema } = require("../validationSchemas");
const { appConfig } = require("../config");
const router = require("express").Router();

module.exports = function (app) {
  router.get(
    "/:_id?",
    authJwt.verifyToken,
    authJwt.checkPermission("faq_documents_read"),
    controller.findAll
  );
  router.post(
    "/",
    authJwt.verifyToken,
    authJwt.checkPermission("faq_documents_create"),
    file.uploadNew([{ name: "files", multiple: true }], "/faq_documents", {
      fileSize: appConfig.supportedFileSizes,
      fileTypes: appConfig.supportedFileTypes,
    }),
    validate(schema.create),
    controller.create
  );
  router.post(
    "/:_id/generate-user-context",
    authJwt.verifyToken,
    validate(schema.generateUserContext),
    controller.generateUserContext
  );
  router.put(
    "/:_id",
    authJwt.verifyToken,
    authJwt.checkPermission("faq_documents_update"),
    file.uploadNew([{ name: "files", multiple: true }], "/faq_documents", {
      fileSize: appConfig.supportedFileSizes,
      fileTypes: appConfig.supportedFileTypes,
    }),
    validate(schema.update),
    controller.update
  );
  router.delete(
    "/:_id?",
    authJwt.verifyToken,
    authJwt.checkPermission("faq_documents_delete"),
    controller.delete
  );

  app.use("/api/faq-documents", router);
};
