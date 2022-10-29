const jwt = require("jsonwebtoken");
const {
  appConfig: { responseFn },
} = require("../config");

const { User } = require("../models");
const { appHelper, dbHelper } = require("../helpers");

var bcrypt = require("bcryptjs");

verifyToken = async (req, res, next) => {
  const requestType = req.headers["request-type"];

  // let token = req.cookies.access_token;
  const token = req.headers["x-access-token"];

  if (!token) {
    return responseFn.error(res, {}, "No token provided!", 403);
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return responseFn.error(res, {}, "Unauthorized!", 401);
    }

    let Model = User;
    if (req.business) {
      const { Model: model } = await dbHelper.getModel(
        req.business._id + "_Customer"
      );
      if (model) {
        Model = model;
      } else {
        return responseFn.error(res, {}, "Unauthorized!", 401);
      }
    }
    const user = await Model.findOne({ _id: decoded.sub });

    if (!user) {
      return responseFn.error(res, {}, "Unauthorized!", 401);
    }
    req.authUser = user;
    next();
  });
};

const authJwt = { verifyToken };
module.exports = authJwt;
