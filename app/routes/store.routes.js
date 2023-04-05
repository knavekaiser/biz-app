const { authJwt, file, validate } = require("../middlewares");
const { appConfig } = require("../config");
const controller = require("../controllers/store.controller");
const { store: schema } = require("../validationSchemas");
const router = require("express").Router();
const configRouter = require("express").Router();
const homeRouter = require("express").Router();

module.exports = function (app) {
  router.get("/:id?", authJwt.verifyToken, controller.find);
  router.post(
    "/",
    authJwt.verifyToken,
    file.upload(
      [
        { name: "products__0__image" },
        { name: "products__1__image" },
        { name: "products__2__image" },
        { name: "products__3__image" },
        { name: "products__4__image" },
        { name: "products__5__image" },
        { name: "products__6__image" },
        { name: "products__7__image" },
        { name: "products__8__image" },
        { name: "products__9__image" },
        { name: "products__10__image" },
      ],
      "/store_images",
      {
        fileSize: appConfig.supportedImageSizes,
        fileTypes: appConfig.supportedImageTypes,
        override: true,
      }
    ),
    validate(schema.create),
    controller.create
  );
  router.put(
    "/:id",
    authJwt.verifyToken,
    file.upload(
      [
        { name: "products__0__image" },
        { name: "products__1__image" },
        { name: "products__2__image" },
        { name: "products__3__image" },
        { name: "products__4__image" },
        { name: "products__5__image" },
        { name: "products__6__image" },
        { name: "products__7__image" },
        { name: "products__8__image" },
        { name: "products__9__image" },
        { name: "products__10__image" },
      ],
      "/store_images",
      {
        fileSize: appConfig.supportedImageSizes,
        fileTypes: appConfig.supportedImageTypes,
        override: true,
      }
    ),
    validate(schema.update),
    controller.update
  );
  router.delete("/:id?", authJwt.verifyToken, controller.delete);

  app.use("/api/stores", router);

  // -------------------------------------------------- config
  configRouter.get("/", authJwt.verifyToken, controller.storeConfig);
  configRouter.put("/", authJwt.verifyToken, controller.updateStoreConfig);

  app.use("/api/store-config", configRouter);

  // -------------------------------------------------- public
  homeRouter.get("/stores", controller.homeStores);
  homeRouter.get("/categories", controller.homeCategories);
  homeRouter.get("/config", controller.homeConfig);
  app.use("/api/home", homeRouter);
};
