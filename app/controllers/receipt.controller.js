const {
  appConfig: { responseFn, responseStr },
} = require("../config");

const { Receipt, Config } = require("../models");

exports.findAll = async (req, res) => {
  try {
    Receipt.find({ user: req.authUser._id })
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const { nextReceiptNo } =
      (await Config.findOne({ user: req.authUser._id })) || {};

    new Receipt({
      ...req.body,
      user: req.authUser._id,
      no: nextReceiptNo || 1,
    })
      .save()
      .then(async (data) => {
        await Config.findOneAndUpdate(
          { user: req.authUser._id },
          { $inc: { nextReceiptNo: 1 } },
          { new: true }
        );
        return responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    delete req.body.no;
    Receipt.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
      .then((data) => {
        return responseFn.success(res, { data }, responseStr.record_updated);
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.delete = async (req, res) => {
  try {
    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    Receipt.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
