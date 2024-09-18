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
String.prototype.isJSON = function () {
  try {
    JSON.parse(this);
  } catch (err) {
    return false;
  }
  return true;
};

const parseTimeShorthand = (time) => {
  if (time.match(/[0-9]+s/)) {
    time = `${parseInt(time)}`; // second
  } else if (time.match(/[0-9]+m/)) {
    time = `0 ${parseInt(time)}`; // minute
  } else if (time.match(/[0-9]+h/)) {
    time = `0 0 ${parseInt(time)}`; // hour
  } else if (time.match(/[0-9]+D/)) {
    time = `0 0 0 ${parseInt(time)}`; // day
  } else if (time.match(/[0-9]+M/)) {
    time = `0 0 0 0 ${parseInt(time)}`; // month
  } else if (time.match(/[0-9]+Y/)) {
    time = `0 0 0 0 0 ${parseInt(time)}`; // year
  }
  return time;
};
Date.prototype.deduct = function (time) {
  if (time.match(/[a-z]/gi)) {
    time = parseTimeShorthand(time);
  }
  const [sec, min, hour, day, month, year] = time
    .split(" ")
    .map((t) => parseInt(t))
    .filter((t) => !isNaN(t));

  let date = new Date(this);
  if (sec) {
    date = new Date(date.setSeconds(date.getSeconds() - sec));
  }
  if (min) {
    date = new Date(date.setMinutes(date.getMinutes() - min));
  }
  if (hour) {
    date = new Date(date.setHours(date.getHours() - hour));
  }
  if (day) {
    date = new Date(date.setDate(date.getDate() - day));
  }
  if (month) {
    date = new Date(date.setMonth(date.getMonth() - month));
  }
  if (year) {
    date = new Date(date.setYear(date.getFullYear() - year));
  }

  return date;
};
Date.prototype.add = function (time) {
  if (time.match(/[a-z]/gi)) {
    time = parseTimeShorthand(time);
  }

  const [sec, min, hour, day, month, year] = time
    .split(" ")
    .map((t) => parseInt(t))
    .filter((t) => !isNaN(t));

  let date = new Date(this);
  if (sec) {
    date = new Date(date.setSeconds(date.getSeconds() + sec));
  }
  if (min) {
    date = new Date(date.setMinutes(date.getMinutes() + min));
  }
  if (hour) {
    date = new Date(date.setHours(date.getHours() + hour));
  }
  if (day) {
    date = new Date(date.setDate(date.getDate() + day));
  }
  if (month) {
    date = new Date(date.setMonth(date.getMonth() + month));
  }
  if (year) {
    date = new Date(date.setYear(date.getFullYear() + year));
  }

  return date;
};

Object.validate = async function (schema) {
  return schema.validate(this);
};
Object.prototype.findProperties = function (prop) {
  const arr = [];
  const findProperties = (obj, parent) => {
    for (var key in obj) {
      if (key === prop) {
        arr.push({
          prop: key,
          value: obj[key],
          path: `${parent ? parent + "." : ""}${prop}`,
        });
      } else if (obj[key] && typeof obj[key] === "object") {
        findProperties(obj[key], `${parent ? parent + "." : ""}${key}`);
      }
    }
  };
  findProperties(this);
  return arr;
};

export * as appHelper from "./app.helper.js";
export * as smsHelper from "./sms.helper.js";
export * as emailHelper from "./email.helper.js";
export * as dbHelper from "./db.helper.js";
export * as fileHelper from "./file.helper.js";
export * as aiHelper from "./ai.helper.js";
export * as razorpayHelper from "./razorpay.helper.js";
export * as cdnHelper from "./cdn.helper.js";
