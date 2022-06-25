const {
  authConfig,
  appConfig: { responseFn, responseStr },
} = require("../config");
const { appHelper, genId } = require("../helpers");

const { User, Config } = require("../models");

exports.signup = async (req, res) => {
  try {
    req.body.password = appHelper.generateHash(req.body.password);

    new User({ ...req.body })
      .save()
      .then(async (user) => {
        await new Config({ user: user._id }).save();
        return appHelper.signIn(res, user._doc);
      })
      .catch((err) => {
        return responseFn.error(res, {}, err.message);
      });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.body.phone });

    if (user && appHelper.compareHash(req.body.password, user.password)) {
      return appHelper.signIn(res, user._doc);
    } else {
      return responseFn.error(res, {}, responseStr.invalid_cred);
    }
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("access_token");
    return responseFn.success(res, {});
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.profile = (req, res) => {
  try {
    User.findOne({ _id: req.authUser.id }, "-password -__v -updatedAt")
      .then(async (data) => responseFn.success(res, { data }))
      .catch((error) => responseFn.error(res, {}, error.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    if (req.body.password) {
      req.body.password = appHelper.generateHash(req.body.password);
    }
    if (req.body.ownerSignature) {
      req.body.ownerDetails = {
        ...req.body.ownerDetails,
        signature: req.body.ownerSignature,
      };
    }
    User.findOneAndUpdate({ _id: req.authUser._id }, req.body, { new: true })
      .then((data) =>
        responseFn.success(
          res,
          {
            data: {
              ...data._doc,
              password: undefined,
              __v: undefined,
              updatedAt: undefined,
            },
          },
          responseStr.record_updated
        )
      )
      .catch((error) => responseFn.error(res, {}, error.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
