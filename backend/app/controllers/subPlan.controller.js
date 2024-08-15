import { appConfig } from "../config/index.js";
import { ObjectId } from "mongodb";
import { SubPlan } from "../models/index.js";

const { responseFn, responseStr } = appConfig;

export const findAll = async (req, res) => {
  try {
    const { page, pageSize, ...q } = req.query;
    const conditions = { ...q };
    if (conditions.name) {
      conditions.name = {
        $regex: conditions.name,
        $options: "i",
      };
    }
    if (req.params._id) {
      conditions._id = ObjectId(req.params._id);
    }
    SubPlan.aggregate([{ $match: conditions }, { $project: { __v: 0 } }])
      .then((data) => {
        responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const create = async (req, res) => {
  try {
    new SubPlan({ ...req.body })
      .save()
      .then((data) => {
        return responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const update = async (req, res) => {
  try {
    SubPlan.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
      .then((data) => {
        return responseFn.success(res, { data }, responseStr.record_updated);
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const deletePlan = async (req, res) => {
  try {
    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    SubPlan.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
