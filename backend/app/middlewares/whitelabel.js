import { appConfig } from "../config/index.js";
import { appHelper } from "../helpers/index.js";

import { Company } from "../models/index.js";

const localhosts = [
  "localhost:3000",
  "localhost:3001",
  "localhost:4005",
  "127.0.0.1:4005",
];

const { normalizeDomain } = appHelper;
const { responseFn, responseStr } = appConfig;

export const getBusiness = async (req, res, next) => {
  let domain = normalizeDomain(req.headers["referer"] || req.headers["origin"]);
  if (!domain)
    return responseFn.error(res, {}, responseStr.domain_not_specified);
  // if (localhosts.includes(domain)) domain = "infinai.loca.lt";

  const business = await Company.findOne({ domain });
  if (!business)
    return responseFn.error(
      res,
      {},
      responseStr.record_not_found.replace("Record", "Business")
    );

  req.business = business;
  next();
};

export const getBusinessOptinal = async (req, res, next) => {
  let domain = normalizeDomain(req.headers["referer"] || req.headers["origin"]);
  // if (localhosts.includes(domain)) domain = "infinai.loca.lt";

  const business = await Company.findOne({ domain });

  req.business = business;
  next();
};
