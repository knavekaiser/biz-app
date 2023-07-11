const {
  appConfig: { responseFn },
} = require("../config");
const { jwtVerify } = require("jose");

const { User, Staff, Role, Admin, SubPlan } = require("../models");
const { dbHelper } = require("../helpers");
const { responseStr } = require("../config/app.config");

verifyToken = async (req, res, next) => {
  const token = req.cookies.access_token || req.headers["x-access-token"];
  const business_id = req.headers["x-business-id"];

  if (!token) {
    res.clearCookie("access_token");
    return responseFn.error(res, {}, "No token provided!", 401);
  }

  try {
    const { payload: decoded } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    let Model = User;
    if (req.business) {
      const { Model: model } = await dbHelper.getModel(
        req.business._id + "_Customer"
      );
      if (model) {
        Model = model;
      } else {
        res.clearCookie("access_token");
        return responseFn.error(res, {}, "Unauthorized!", 401);
      }
    } else if (decoded.userType === "staff") {
      Model = Staff;
    } else if (decoded.userType === "admin") {
      Model = Admin;
    }
    const user = await Model.findOne({ _id: decoded.sub });
    if (!user) {
      res.clearCookie("access_token");
      return responseFn.error(res, {}, "Unauthorized!", 401);
    }

    if (decoded.userType === "business" && user?.subscription?.plan) {
      req.subPlan = await SubPlan.findOne({ _id: user.subscription.plan });
    }

    if (["staff", "admin"].includes(decoded.userType) && business_id) {
      req.business = await User.findOne({ _id: business_id });
      if (req.business?.subscription?.plan) {
        req.subPlan = await SubPlan.findOne({
          _id: req.business.subscription.plan,
        });
      }
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
  } catch (err) {
    res.clearCookie("access_token");
    return responseFn.error(res, {}, "Unauthorized!", 401);
  }
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

verifyOrigin = async (req, res, next) => {
  try {
    const origin = (req.headers.origin || req.headers.host || "").replace(
      /^(?:https?:\/\/)?(?:www\.)?([^\/?]+)(?:\/[^?]+)?.*/,
      "$1"
    );
    req.business = (
      await User.aggregate([{ $match: { "chatbots.domain": origin } }])
    )[0];
    if (!req.business) {
      return responseFn.error(res, {}, "Unauthorized!", 401);
    }

    next();
  } catch (err) {
    return responseFn.error(res, {}, "Unauthorized!", 401);
  }
};

module.exports = { verifyToken, checkPermission, verifyOrigin };
