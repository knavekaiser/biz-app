const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { createCipheriv, createDecipheriv } = require("crypto");
const {
  authConfig,
  appConfig,
  appConfig: { responseFn, responseStr },
} = require("../config");
const { User } = require("../models");

exports.generateHash = (string) => bcrypt.hashSync(string, 8);

exports.compareHash = (password, hash) => bcrypt.compareSync(password, hash);

exports.signIn = (res, user) => {
  const token = signToken({ sub: user._id });
  ["password", "__v", "updatedAt"].forEach((key) => delete user[key]);
  res.cookie("access_token", token, {
    maxAge: 50000,
    httpOnly: true,
    sameSite: "strict",
  });
  responseFn.success(res, { data: user, token: token });
};

exports.json = (data) => JSON.parse(JSON.stringify(data));

exports.decodeToken = (token) => {
  if (!token) {
    return { status: false, message: "Invalid access!", statusCode: 200 };
  }
  return jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      return { status: false, message: "Unauthorized!", statusCode: 200 };
    }
    return { status: true, data: { ...decoded } };
  });
};

const signToken = (data) => {
  return jwt.sign(
    {
      iss: appConfig.appName,
      ...data,
    },
    process.env.JWT_SECRET
  );
};

exports.genId = (l, { uppercase, lowercase, letters, numbers } = {}) => {
  const _l = "abcdefghijklmnopqrstuvwxyz";
  const _n = "0123456789";
  let a =
    !numbers && !letters ? _l + _n : (letters ? _l : "") + (numbers ? _n : "");

  let id = "";

  for (let i = 0; i < l; i++) {
    id += a[Math.floor(Math.random() * a.length)];
  }

  if (uppercase) {
    id = id.toUpperCase();
  }
  if (lowercase) {
    id = id.toLowerCase();
  }

  return id;
};
