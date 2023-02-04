const { authJwt, validate } = require("../middlewares");
const controller = require("../controllers/employee.controller");
const { employee: schema } = require("../validationSchemas");
var router = require("express").Router();

module.exports = function (app) {
  router.put(
    "/",
    authJwt.verifyToken,
    validate(schema.update),
    controller.update
  );
  router.get("/:id?", authJwt.verifyToken, controller.findAll);

  app.use("/api/employees", router);
};
