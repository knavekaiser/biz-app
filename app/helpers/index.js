Number.prototype.getPercentage = function (n) {
  return 100 - (this - n) / (this / 100);
};
Number.prototype.percent = function (n) {
  return (this / 100) * n;
};

String.prototype.camelize = function () {
  return this.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, "");
};

Object.validate = async function (schema) {
  return schema.validate(this);
};

module.exports = {
  appHelper: require("./app.helper"),
  smsHelper: require("./sms.helper"),
  dbHelper: require("./db.helper"),
};
