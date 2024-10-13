import { appConfig } from "../config/index.js";
import { getModel } from "../models/index.js";

const { responseFn, responseStr } = appConfig;

export const get = async (req, res) => {
  try {
    const InventoryBranch = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "InventoryBranch",
    });

    InventoryBranch.find()
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const create = async (req, res) => {
  try {
    const InventoryBranch = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "InventoryBranch",
    });

    new InventoryBranch(req.body)
      .save()
      .then(async (data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const update = async (req, res) => {
  try {
    const InventoryBranch = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "InventoryBranch",
    });

    InventoryBranch.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
    })
      .then((data) => {
        responseFn.success(res, { data }, responseStr.record_updated);
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const remove = async (req, res) => {
  try {
    const InventoryBranch = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "InventoryBranch",
    });

    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    InventoryBranch.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
