global.mongoose = require("mongoose");
global.Schema = mongoose.Schema;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected to db"))
  .catch((err) => console.log("could not connect to db, here's why: " + err));

module.exports = {
  Admin: require("./admin.model"),
  Config: require("./config.model"),
  User: require("./user.model"),
  Staff: require("./staff.model"),
  Otp: require("./otp.model"),
  Invoice: require("./invoice.model"),
  Receipt: require("./receipt.model"),
  Purchase: require("./purchase.model"),
  Payment: require("./payment.model"),
  Collection: require("./collection.model"),
  Order: require("./order.model"),
  Quote: require("./quote.model"),
  Role: require("./role.model"),
  Store: require("./store.model"),
  Category: require("./category.model"),
};
