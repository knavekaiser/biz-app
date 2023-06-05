const jwt = require("jsonwebtoken");
const {
  appConfig: { responseFn, responseStr },
} = require("../config");

const { User } = require("../models");
const {
  appHelper: { normalizeDomain },
} = require("../helpers");

exports.getBusiness = async (req, res, next) => {
  let domain = normalizeDomain(req.headers["referer"] || req.headers["origin"]);
  if (!domain)
    return responseFn.error(res, {}, responseStr.domain_not_specified);
  if (domain === "localhost:3000") domain = "infinai.loca.lt";

  const business = await User.findOne({ domain });
  if (!business)
    return responseFn.error(
      res,
      {},
      responseStr.record_not_found.replace("Record", "Business")
    );

  req.business = business;
  next();
};
