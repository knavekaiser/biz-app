const {
  appConfig: { responseFn, responseStr },
} = require("../config");
const { Config } = require("../models");

exports.findOne = async (req, res) => {
  try {
    Config.findOne({ user: req.authUser._id }, "-__v")
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    Config.findOneAndUpdate({ user: req.authUser._id }, req.body, { new: true })
      .then((data) => {
        if (data) {
          return responseFn.success(res, { data }, responseStr.record_updated);
        } else {
          return responseFn.error(res, {}, responseStr.record_not_found);
        }
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
