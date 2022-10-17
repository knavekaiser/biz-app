const { authJwt, validate } = require("../middlewares");
const controller = require("../controllers/whiteLabel.controller");
// const { collection: schema } = require("../validationSchemas");
var router = require("express").Router();

module.exports = function (app) {
  router.get("/site-config", controller.getSiteConfig);
  router.get("/elements/:table", controller.getElements);
  router.get("/browse/landing-page-shelves", controller.getLandingPageShelves);
  router.get("/browse/related/:_id", controller.getRelatedProducts);
  router.get("/browse/:_id?", controller.browse);

  app.use("/api", router);
};
