const { authJwt, validate, whitelabel } = require("../middlewares");
const controller = require("../controllers/whiteLabel.controller");
const { whitelabel: schema } = require("../validationSchemas");
var router = require("express").Router();

module.exports = function (app) {
  router.get("/site-config", whitelabel.getBusiness, controller.getSiteConfig);
  router.get(
    "/dynamic-page-files/:pageId",
    whitelabel.getBusiness,
    controller.getDynamicPageFiles
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

  router.post(
    "/reviews",
    whitelabel.getBusiness,
    authJwt.verifyToken,
    validate(schema.addReview),
    controller.addReview
  );
  router.get("/reviews/:_id", whitelabel.getBusiness, controller.getReviews);

  app.use("/api", router);
};
