import { appConfig } from "../config/index.js";
import { Payment, Config } from "../models/index.js";
import { ObjectId } from "mongodb";

const { responseFn, responseStr } = appConfig;

export const findAll = async (req, res) => {
  try {
    Payment.find({ user: req.business?._id || req.authUser._id })
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

const generateEntries = (body) => {
  return [
    {
      accountId: ObjectId(body.cashAccountId),
      accountName: body.cashAccountName,
      debit: 0,
      credit: body.amount,
    },
    {
      accountId: ObjectId(body.supplierAccountId),
      accountName: body.supplierAccountName,
      debit: body.amount,
      credit: 0,
    },
  ];
};
export const create = async (req, res) => {
  try {
    const { nextPaymentNo } =
      (await Config.findOne({ user: req.business?._id || req.authUser._id })) ||
      {};

    req.body.accountingEntries = generateEntries(req.body);

    new Payment({
      ...req.body,
      user: req.business?._id || req.authUser._id,
      no: nextPaymentNo || 1,
    })
      .save()
      .then(async (data) => {
        await Config.findOneAndUpdate(
          { user: req.business?._id || req.authUser._id },
          { $inc: { nextPaymentNo: 1 } },
          { new: true }
        );
        return responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const update = async (req, res) => {
  try {
    delete req.body.no;
    req.body.accountingEntries = generateEntries(req.body);
    Payment.findOneAndUpdate(
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

export const deletePayment = async (req, res) => {
  try {
    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    Payment.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
      user: req.business?._id || req.authUser._id,
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
