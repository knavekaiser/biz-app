import { authJwt, validate, whitelabel } from "../middlewares/index.js";
import * as controller from "../controllers/whiteLabel.controller.js";
import { whitelabel as schema } from "../validationSchemas/index.js";
import express from "express";
const router = express.Router();

export default function (app) {
  router.get("/site-config", whitelabel.getBusiness, controller.getSiteConfig);
  router.get("/sitemap-urls", whitelabel.getBusiness, controller.sitemapUrls);
  router.get(
    "/dynamic-pages/:path?",
    whitelabel.getBusiness,
    controller.getDynamicPages
  );
  router.get(
    "/elements/:table",
    whitelabel.getBusiness,
    controller.getElements
  );
  router.get(
    "/browse/landing-page-shelves",
    whitelabel.getBusiness,
    controller.getLandingPageShelves
  );
  router.get(
    "/browse/landing-page-categories",
    whitelabel.getBusiness,
    controller.getLandingPageCategories
  );
  router.get(
    "/browse/related/:_id",
    whitelabel.getBusiness,
    controller.getRelatedProducts
  );
  router.get("/browse/:_id?", whitelabel.getBusiness, controller.browse);

  router.post(
    "/customers/validate-account",
    whitelabel.getBusiness,
    validate(schema.validateAccount),
    controller.validateAccount
  );
  router.post(
    "/customers/signup",
    whitelabel.getBusiness,
    validate(schema.signup),
    controller.signup
  );
  router.post(
    "/customers/login",
    whitelabel.getBusiness,
    validate(schema.login),
    controller.login
  );
  router.post("/customers/logout", whitelabel.getBusiness, controller.logout);
  router.get(
    "/customers/profile",
    whitelabel.getBusiness,
    authJwt.verifyToken,
    controller.profile
  );
  router.put(
    "/customers/profile",
    whitelabel.getBusiness,
    authJwt.verifyToken,
    controller.updateProfile
  );

  router.post(
    "/reviews",
    whitelabel.getBusiness,
    authJwt.verifyToken,
    validate(schema.addReview),
    controller.addReview
  );
  router.get("/reviews/:_id", whitelabel.getBusiness, controller.getReviews);

  router.get(
    "/cart",
    whitelabel.getBusiness,
    authJwt.verifyToken,
    controller.getCart
  );
  router.post(
    "/cart",
    whitelabel.getBusiness,
    authJwt.verifyToken,
    validate(schema.updateCart),
    controller.updateCart
  );
  router.get(
    "/customers/orders",
    whitelabel.getBusiness,
    authJwt.verifyToken,
    controller.orders
  );
  router.post(
    "/place-order",
    whitelabel.getBusiness,
    validate(schema.placeOrder),
    authJwt.verifyToken,
    controller.placeOrder
  );
  router.get("/categories", whitelabel.getBusiness, controller.categories);

  app.use("/api", router);
}
