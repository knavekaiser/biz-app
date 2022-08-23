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
  Config: require("./config.model"),
  User: require("./user.model"),
  Otp: require("./otp.model"),
  Invoice: require("./invoice.model"),
  Receipt: require("./receipt.model"),
  Purchase: require("./purchase.model"),
  Payment: require("./payment.model"),
};
