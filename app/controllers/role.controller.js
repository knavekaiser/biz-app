const {
  appConfig: { responseFn, responseStr },
} = require("../config");

const { Role } = require("../models");

exports.findAll = async (req, res) => {
  try {
    Role.find({ user: req.business?._id || req.authUser._id })
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    new Role({
      ...req.body,
      user: req.business?._id || req.authUser._id,
    })
      .save()
      .then(async (data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    Role.findOneAndUpdate(
      { _id: req.params.id, user: req.business?._id || req.authUser._id },
      req.body,
      { new: true }
    )
      .then((data) => {
        responseFn.success(res, { data }, responseStr.record_updated);
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
    Role.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
      user: req.business?._id || req.authUser._id,
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
