const { authJwt, file, validate } = require("../middlewares");
const { appConfig } = require("../config");
const controller = require("../controllers/user.controller");
const { users: schema } = require("../validationSchemas");
var router = require("express").Router();

module.exports = function (app) {
  //-------------------------- Auth
  router.post("/signup", validate(schema.signup), controller.signup);
  router.post("/signin", validate(schema.login), controller.login);
  router.post(
    "/forgot-password",
    validate(schema.forgotPassword),
    controller.forgotPassword
  );
  router.post(
    "/reset-password",
    validate(schema.resetPassword),
    controller.resetPassword
  );
  router.post("/logout", controller.logout);

  //-------------------------- Profile
  router.get("/profile", [authJwt.verifyToken], controller.profile);
  router.put(
    "/profile",
    [
      authJwt.verifyToken,
      file.upload([{ name: "logo" }, { name: "ownerSignature" }], "/", {
        fileSize: appConfig.supportedImageSizes,
        fileTypes: appConfig.supportedImageTypes,
        override: true,
      }),
    ],
    validate(schema.update),
    controller.update
  );

  app.use("/api/users", router);
};
