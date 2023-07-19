const {
  appConfig: { responseFn, responseStr },
} = require("../config");

const { User } = require("../models");
const {
  appHelper: { normalizeDomain },
} = require("../helpers");

const localhosts = [
  "localhost:3000",
  "localhost:3001",
  "localhost:4005",
  "127.0.0.1:4005",
];

exports.getBusiness = async (req, res, next) => {
  let domain = normalizeDomain(req.headers["referer"] || req.headers["origin"]);
  if (!domain)
    return responseFn.error(res, {}, responseStr.domain_not_specified);
  // if (localhosts.includes(domain)) domain = "infinai.loca.lt";

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

exports.getBusinessOptinal = async (req, res, next) => {
  let domain = normalizeDomain(req.headers["referer"] || req.headers["origin"]);
  // if (localhosts.includes(domain)) domain = "infinai.loca.lt";

  const business = await User.findOne({ domain });

  req.business = business;
  next();
};
