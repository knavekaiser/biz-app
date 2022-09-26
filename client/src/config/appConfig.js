Number.prototype.getPercentage = function (n) {
  return 100 - (this - n) / (this / 100);
};
Number.prototype.percent = function (n) {
  return (this / 100) * n;
};
Number.prototype.fix = function (n, locale) {
  const decimal = this.toFixed(n).replace(/.*\./, "");
  if (locale) {
    return parseInt(this).toLocaleString(locale) + "." + decimal;
  }
  return +this.toFixed(n);
};

Number.prototype.pad = function (l) {
  let ziros = "";
  for (let i = 0; i < l; i++) ziros += "0";
  return ziros.length >= `${this}`.length ? (ziros + this).slice(-l) : this;
};

var a = [
  "",
  "one ",
  "two ",
  "three ",
  "four ",
  "five ",
  "six ",
  "seven ",
  "eight ",
  "nine ",
  "ten ",
  "eleven ",
  "twelve ",
  "thirteen ",
  "fourteen ",
  "fifteen ",
  "sixteen ",
  "seventeen ",
  "eighteen ",
  "nineteen ",
];
var b = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

Number.prototype.toWords = function () {
  if (parseInt(this).toString().length > 9) return this;
  let n = ("000000000" + parseInt(this))
    .substr(-9)
    .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return;
  var str = "";
  str +=
    n[1] !== 0 ? (a[+n[1]] || b[n[1][0]] + " " + a[n[1][1]]) + "crore " : "";
  str +=
    n[2] !== 0 ? (a[+n[2]] || b[n[2][0]] + " " + a[n[2][1]]) + "lakh " : "";
  str +=
    n[3] !== 0 ? (a[+n[3]] || b[n[3][0]] + " " + a[n[3][1]]) + "thousand " : "";
  str +=
    n[4] !== 0 ? (a[+n[4]] || b[n[4][0]] + " " + a[n[4][1]]) + "hundred " : "";
  str +=
    n[5] !== 0
      ? (str !== "" ? "and " : "") +
        (a[+n[5]] || b[n[5][0]] + " " + a[n[5][1]]) +
        "only "
      : "";
  return str;
};

export default {
  //
};
