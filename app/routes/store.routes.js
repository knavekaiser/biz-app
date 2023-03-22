const { authJwt, file, validate } = require("../middlewares");
const { appConfig } = require("../config");
const controller = require("../controllers/store.controller");
const { store: schema } = require("../validationSchemas");
var router = require("express").Router();

module.exports = function (app) {
  router.get("/landing-page", controller.landingPageStores);

  router.get("/:id?", authJwt.verifyToken, controller.find);
  router.post(
    "/",
    authJwt.verifyToken,
    file.upload({ name: "image" }, "/store_images", {
      fileSize: appConfig.supportedImageSizes,
      fileTypes: appConfig.supportedImageTypes,
      override: true,
    }),
    validate(schema.create),
    controller.create
  );
  router.put(
    "/:id",
    authJwt.verifyToken,
    file.upload({ name: "image" }, "/store_images", {
      fileSize: appConfig.supportedImageSizes,
      fileTypes: appConfig.supportedImageTypes,
      override: true,
    }),
    validate(schema.update),
    controller.update
  );
  router.delete("/:id?", authJwt.verifyToken, controller.delete);

  app.use("/api/stores", router);
};
