const { authJwt, validate } = require("../middlewares");
const controller = require("../controllers/employee.controller");
const { employee: schema } = require("../validationSchemas");
var router = require("express").Router();

module.exports = function (app) {
  router.put(
    "/",
    authJwt.verifyToken,
    authJwt.checkPermission("employee_update"),
    validate(schema.update),
    controller.update
  );
  router.get(
    "/:id?",
    authJwt.verifyToken,
    authJwt.checkPermission("employee_read"),
    controller.findAll
  );

  app.use("/api/employees", router);
};
