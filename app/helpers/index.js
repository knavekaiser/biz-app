Number.prototype.getPercentage = function (n) {
  return 100 - (this - n) / (this / 100);
};
Number.prototype.percent = function (n) {
  return (this / 100) * n;
};

module.exports = {
  appHelper: require("./app.helper"),
  smsHelper: require("./sms.helper"),
};
