import { appConfig } from "../config/index.js";
import { ObjectId } from "mongodb";
import { Order, Quote } from "../models/index.js";

const { responseFn, responseStr } = appConfig;

export const findAll = async (req, res) => {
  try {
    const conditions = {
      user: ObjectId(req.business?._id || req.authUser._id),
    };
    Order.aggregate([{ $match: conditions }, { $project: { __v: 0 } }])
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const create = async (req, res) => {
  try {
    new Order({
      ...req.body,
      user: req.business?._id || req.authUser._id,
    })
      .save()
      .then(async (data) => {
        return responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const generateFromQuote = async (req, res) => {
  try {
    const quote = await Quote.findOne({
      _id: req.body.quote_id,
      user: ObjectId(req.business?._id || req.authUser._id),
    });
    if (!quote) {
      return responseFn.error(
        res,
        {},
        responseStr.record_not_found.replace("Record", "Quote"),
        400
      );
    }
    new Order({
      ...quote._doc,
      status: "pending",
    })
      .save()
      .then(async (data) => {
        await Quote.updateOne({ _id: quote._id }, { status: "ordered" });
        return responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const update = async (req, res) => {
  try {
    Order.findOneAndUpdate(
      { _id: req.params.id, user: req.business?._id || req.authUser._id },
      req.body,
      { new: true }
    )
      .then((data) => {
        return responseFn.success(res, { data }, responseStr.record_updated);
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const deleteOrder = async (req, res) => {
  try {
    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    Order.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
      user: req.business?._id || req.authUser._id,
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
