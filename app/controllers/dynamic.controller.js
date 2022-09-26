const {
  appConfig: { responseFn, responseStr },
} = require("../config");
const { dbHelper } = require("../helpers");

const { Collection, Config } = require("../models");

exports.findAll = async (req, res) => {
  try {
    const Model = await dbHelper.getModel(
      req.authUser._id + "_" + req.params.table
    );
    const conditions = { user: req.authUser._id };
    if (req.params.id) {
      conditions._id = req.params.id;
    }
    Model.find(conditions)
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const Model = await dbHelper.getModel(
      req.authUser._id + "_" + req.params.table
    );
    new Model({
      ...req.body,
      user: req.authUser._id,
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

exports.update = async (req, res) => {
  try {
    const Model = await dbHelper.getModel(
      req.authUser._id + "_" + req.params.table
    );
    Model.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
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
    const Model = await dbHelper.getModel(
      req.authUser._id + "_" + req.params.table
    );
    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    Model.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
