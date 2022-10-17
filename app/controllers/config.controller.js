const {
  appConfig: { responseFn, responseStr },
} = require("../config");
const { fileHelper } = require("../helpers");
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
    const config = await Config.findOne({ user: req.authUser._id });
    if (req.body.siteConfig) {
      const oldSlides = config.siteConfig.landingPage?.hero?.slides || [];
      const reqSlides = req.body.siteConfig.landingPage?.hero?.slides || [];
      const filesToRemove = oldSlides.filter(
        (url) => !reqSlides.some((u) => u === url)
      );
      if (filesToRemove?.length) {
        fileHelper.deleteFiles(filesToRemove);
      }
    }
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
