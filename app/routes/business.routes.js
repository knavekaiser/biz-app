const { authJwt, file, validate } = require("../middlewares");
const { appConfig } = require("../config");
const controller = require("../controllers/business.controller");
const { users: schema } = require("../validationSchemas");
const routerExcl = require("express").Router();
const router = require("express").Router();

module.exports = function (app) {
  //-------------------------- Auth
  routerExcl.post("/signup", validate(schema.signup), controller.signup);
  routerExcl.post("/signin", validate(schema.login), controller.login);
  routerExcl.post(
    "/forgot-password",
    validate(schema.forgotPassword),
    controller.forgotPassword
  );
  routerExcl.post(
    "/reset-password",
    validate(schema.resetPassword),
    controller.resetPassword
  );
  routerExcl.post("/logout", controller.logout);

  //-------------------------- Profile
  routerExcl.get("/profile", authJwt.verifyToken, controller.profile);
  routerExcl.put(
    "/profile",
    authJwt.verifyToken,
    file.upload(
      [{ name: "logo" }, { name: "ownerSignature" }, { name: "favicon" }],
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

  app.use("/api/business", routerExcl);

  router.get("/find", authJwt.verifyToken, controller.find);
  router.put(
    "/:_id",
    authJwt.verifyToken,
    file.upload(
      [{ name: "logo" }, { name: "ownerSignature" }, { name: "favicon" }],
      "/",
      {
        fileSize: appConfig.supportedImageSizes,
        fileTypes: appConfig.supportedImageTypes,
        override: true,
      }
    ),
    validate(schema.update),
    controller.updateBusiness
  );
  app.use("/api/businesses", router);
};
