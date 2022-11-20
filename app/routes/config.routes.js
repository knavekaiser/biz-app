const { authJwt, validate, file } = require("../middlewares");
const { appConfig } = require("../config");
const controller = require("../controllers/config.controller");
const { config: schema } = require("../validationSchemas");
var router = require("express").Router();

module.exports = function (app) {
  router.put(
    "/",
    authJwt.verifyToken,
    file.upload(
      [
        { name: "siteConfig.landingPage.hero.slides", multiple: true },
        { name: "dynamicPageFiles", multiple: true },
      ],
      "/",
      {
        fileSize: appConfig.supportedImageSizes,
        fileTypes: appConfig.supportedImageTypes,
        override: true,
      }
    ),
    validate(schema.update),
    controller.update
  );
  router.get("/", authJwt.verifyToken, controller.findOne);

  app.use("/api/user-config", router);
};
