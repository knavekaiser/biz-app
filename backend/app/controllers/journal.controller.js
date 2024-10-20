import { appConfig } from "../config/index.js";
import { Config, getModel } from "../models/index.js";

const { responseFn, responseStr } = appConfig;

const entryPipeline = [
  {
    $unwind: {
      path: "$accountingEntries",
      includeArrayIndex: "index",
      preserveNullAndEmptyArrays: false,
    },
  },
  {
    $set: {
      "accountingEntries.rec_id": "$_id",
      "accountingEntries.no": "$no",
      "accountingEntries.dateTime": "$dateTime",
      "accountingEntries.detail": "$detail",
      "accountingEntries.index": "$index",
    },
  },
  { $replaceRoot: { newRoot: "$accountingEntries" } },
];
export const findAll = async (req, res) => {
  try {
    const Journal = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Journal",
    });

    const condition = {};
    if (req.query.accountId) {
      condition.accountId = req.query.accountId;
    }

    Journal.aggregate([{ $match: condition }, ...entryPipeline])
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const create = async (req, res) => {
  try {
    const Journal = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Journal",
    });

    const { nextJournalNo } =
      (await Config.findOne({ user: req.business?._id || req.authUser._id })) ||
      {};

    new Journal({
      ...req.body,
      no: nextJournalNo || 1,
    })
      .save()
      .then(async (data) => {
        await Config.findOneAndUpdate(
          { user: req.business?._id || req.authUser._id },
          { $inc: { nextJournalNo: 1 } },
          { new: true }
        );
        const newEntries = await Journal.aggregate([
          { $match: { _id: data._id } },
          ...entryPipeline,
        ]);
        return responseFn.success(res, { data: newEntries });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const update = async (req, res) => {
  try {
    const Journal = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Journal",
    });

    delete req.body.no;
    Journal.findOneAndUpdate({ _id: req.params._id }, req.body, { new: true })
      .then(async (data) => {
        const newEntries = await Journal.aggregate([
          { $match: { _id: data._id } },
          ...entryPipeline,
        ]);
        responseFn.success(res, { data: newEntries });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const deleteEntry = async (req, res) => {
  try {
    const Journal = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Journal",
    });

    if (!req.params._id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    Journal.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params._id] },
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
