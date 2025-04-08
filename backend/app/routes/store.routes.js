import { authJwt, file, validate } from "../middlewares/index.js";
import { appConfig } from "../config/index.js";
import * as controller from "../controllers/store.controller.js";
import { store as schema } from "../validationSchemas/index.js";

import express from "express";
const router = express.Router();
const configRouter = express.Router();
const homeRouter = express.Router();

export default function (app) {
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
      { pathname: "store_images/" }
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
      { pathname: "store_images/" }
    ),
    validate(schema.update),
    controller.update
  );
  router.delete("/:id?", authJwt.verifyToken, controller.deleteStore);

  app.use("/api/stores", router);

  // -------------------------------------------------- config
  configRouter.get("/", authJwt.verifyToken, controller.storeConfig);
  configRouter.put("/", authJwt.verifyToken, controller.updateStoreConfig);

  app.use("/api/store-config", configRouter);

  // -------------------------------------------------- public
  homeRouter.get("/stores", controller.homeStores);
  homeRouter.get("/store-categories", controller.homeStoreCategories);
  homeRouter.get("/config", controller.homeConfig);
  homeRouter.get("/locations", controller.locations);
  app.use("/api/home", homeRouter);
}
