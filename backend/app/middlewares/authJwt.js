import { appConfig } from "../config/index.js";
import { jwtVerify } from "jose";

import { Company, Staff, Role, Admin, SubPlan } from "../models/index.js";
import { dbHelper } from "../helpers/index.js";
import { ObjectId } from "mongodb";

const { responseFn, responseStr } = appConfig;

export const verifyToken = async (req, res, next) => {
  const setCookie = req.headers["x-set-cookie"] === "true";
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

    if (
      req.originalUrl.includes("/profile") &&
      !req.originalUrl.includes(`/${decoded.userType}`)
    ) {
      return res.redirect(`/api/${decoded.userType}/profile`);
    }

    let Model = Company;
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

    if (decoded.userType === "company" && user?.subscription?.plan) {
      req.subPlan = await SubPlan.findOne({ _id: user.subscription.plan });
    }

    if (["staff", "admin"].includes(decoded.userType) && business_id) {
      req.business = await Company.findOne({ _id: business_id });
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

    if (setCookie) {
      res.cookie("access_token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 60, // 60 days
        httpOnly: true,
        sameSite: "Strict",
      });
    }
    next();
  } catch (err) {
    res.clearCookie("access_token");
    return responseFn.error(res, {}, "Unauthorized!", 401);
  }
};

export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (req.authToken?.userType === "admin") {
      return next();
    } else if (req.authToken?.userType === "company") {
      return next();
    } else if (req.authToken?.userType === "staff") {
      if (req.permissions.includes(permission)) {
        return next();
      }
    }
    return responseFn.error(res, {}, responseStr.forbidden, 403);
  };
};

export const verifyOrigin = async (req, res, next) => {
  try {
    const chatbot_id = req.headers["x-chatbot-id"];
    // const origin = (req.headers.origin || req.headers.host || "").replace(
    //   /^(?:https?:\/\/)?(?:www\.)?([^\/?]+)(?:\/[^?]+)?.*/,
    //   "$1"
    // );
    req.business = (
      await Company.aggregate([
        { $match: { "chatbots._id": ObjectId(chatbot_id) } },
      ])
    )[0];
    req.chatbot = req.business?.chatbots?.find(
      (bot) => bot._id === ObjectId(chatbot_id)
    );
    if (!req.business && !req.chatbot) {
      return responseFn.error(res, {}, "Unauthorized!", 401);
    }

    next();
  } catch (err) {
    return responseFn.error(res, {}, "Unauthorized!", 401);
  }
};
