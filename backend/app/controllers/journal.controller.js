import { appConfig } from "../config/index.js";
import { Journal } from "../models/index.js";

const { responseFn, responseStr } = appConfig;

export const findAll = async (req, res) => {
  try {
    const condition = { company: req.business?._id || req.authUser._id };
    if (req.query.accountId) {
      condition.accountId = req.query.accountId;
    }

    Journal.find(condition)
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const create = async (req, res) => {
  try {
    Journal.create(
      req.body.entries.map((entry) => ({
        ...entry,
        company: req.business?._id || req.authUser._id,
      }))
    )
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const update = async (req, res) => {
  try {
    Journal.findOneAndUpdate(
      {
        company: req.business?._id || req.authUser._id,
        _id: req.params._id,
      },
      { ...req.body, company: req.business?._id || req.authUser._id },
      { new: true }
    )
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const deleteEntry = async (req, res) => {
  try {
    if (!req.params._id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    Journal.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params._id] },
      company: req.business?._id || req.authUser._id,
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
