import { appConfig } from "../config/index.js";
import { getModel } from "../models/index.js";

const { responseFn, responseStr } = appConfig;

export const find = async (req, res) => {
  try {
    const FinPeriod = getModel({
      companyId: (req.business || req.authUser)._id,
      name: "FinancialPeriod",
    });

    FinPeriod.aggregate([{ $project: { __v: 0 } }])
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const create = async (req, res) => {
  try {
    const FinPeriod = getModel({
      companyId: (req.business || req.authUser)._id,
      name: "FinancialPeriod",
    });

    new FinPeriod(req.body)
      .save()
      .then(async (data) => {
        return responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const update = async (req, res) => {
  try {
    const FinPeriod = getModel({
      companyId: (req.business || req.authUser)._id,
      name: "FinancialPeriod",
    });

    FinPeriod.findOneAndUpdate({ _id: req.params._id }, req.body, { new: true })
      .then((data) => {
        return responseFn.success(res, { data }, responseStr.record_updated);
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const remove = async (req, res) => {
  try {
    const FinPeriod = getModel({
      companyId: (req.business || req.authUser)._id,
      name: "FinancialPeriod",
    });

    if (!req.params._id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    FinPeriod.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params._id] },
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
