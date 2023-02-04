module.exports = function (app) {
  require("./user.routes")(app);
  require("./staffs.routes")(app);
  require("./invoice.routes")(app);
  require("./purchase.routes")(app);
  require("./receipt.routes")(app);
  require("./config.routes")(app);
  require("./payment.routes")(app);
  require("./collection.routes")(app);
  require("./dynamic.routes")(app);
  require("./whiteLabel.routes")(app);
  require("./order.routes")(app);
  require("./quote.routes")(app);
  require("./role.routes")(app);
  require("./employees.routes")(app);
};
