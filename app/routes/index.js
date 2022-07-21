module.exports = function (app) {
  require("./user.routes")(app);
  require("./invoice.routes")(app);
  require("./purchase.routes")(app);
  require("./receipt.routes")(app);
  require("./config.routes")(app);
};
