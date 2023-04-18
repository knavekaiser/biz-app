const jwt = require("jsonwebtoken");
const {
  appConfig: { responseFn },
} = require("../config");

const { User, Staff, Role, Admin } = require("../models");
const { dbHelper } = require("../helpers");
const { responseStr } = require("../config/app.config");

verifyToken = async (req, res, next) => {
  // let token = req.cookies.access_token;
  const token = req.headers["x-access-token"];
  const business_id = req.headers["x-business-id"];

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
    } else if (decoded.userType === "staff") {
      Model = Staff;
    } else if (decoded.userType === "admin") {
      Model = Admin;
    }
    const user = await Model.findOne({ _id: decoded.sub });

    if (!user) {
      return responseFn.error(res, {}, "Unauthorized!", 401);
    }
    if (["staff", "admin"].includes(decoded.userType) && business_id) {
      req.business = await User.findOne({ _id: business_id });
      if (req.business && decoded.userType === "staff") {
        const business = user.businesses.find(
          (item) => item.business.toString() === req.business._id.toString()
        );
        if (business) {
          req.permissions = await Role.find({
            _id: { $in: business.roles },
          }).then((data) => data.map((item) => item.permissions).flat());
        }
      }
    }
    req.authUser = user;
    req.authToken = decoded;
    next();
  });
};

checkPermission = (permission) => {
  return (req, res, next) => {
    if (req.authToken?.userType === "admin") {
      return next();
    } else if (req.authToken?.userType === "business") {
      return next();
    } else if (req.authToken?.userType === "staff") {
      if (req.permissions.includes(permission)) {
        return next();
      }
    }
    return responseFn.error(res, {}, responseStr.forbidden, 403);
  };
};

const authJwt = { verifyToken, checkPermission };
module.exports = authJwt;
