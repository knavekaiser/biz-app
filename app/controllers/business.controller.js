const {
  appConfig: { responseFn, responseStr, ...appConfig },
} = require("../config");
const {
  appHelper,
  smsHelper,
  appHelper: { genId },
  dbHelper,
} = require("../helpers");

const { User, Otp, Config, Collection } = require("../models");

exports.signup = async (req, res) => {
  try {
    req.body.password = appHelper.generateHash(req.body.password);

    new User({ ...req.body })
      .save()
      .then(async (user) => {
        await new Config({ user: user._id }).save();
        await Collection.insertMany(
          dbHelper.defaultSchemas.map((item) => ({ ...item, user: user._id }))
        );
        return appHelper.signIn(res, user._doc, "business");
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
      return appHelper.signIn(res, user._doc, "business");
    } else {
      return responseFn.error(res, {}, responseStr.invalid_cred);
    }
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.body.phone });

    if (user) {
      const otp = genId(6, { numbers: true });
      new Otp({
        user: user._id,
        code: appHelper.generateHash(otp),
      })
        .save()
        .then(async (otpRec) => {
          // smsHelper.send()
          const result = { success: true };
          if (result.success) {
            return responseFn.success(
              res,
              {
                data: {
                  phone: user.phone,
                  timeout: appConfig.otpTimeout,
                },
              },
              responseStr.otp_sent + ` (use ${otp})`
            );
          } else {
            await Otp.deleteOne({ _id: otpRec._id });
            return responseFn.error(res, {}, responseStr.otp_sms_failed);
          }
        })
        .catch(async (err) => {
          if (err.code === 11000) {
            const otpRec = await Otp.findOne({ user: user._id });

            return responseFn.error(
              res,
              {
                cooldown: parseInt(
                  appConfig.otpTimeout -
                    (new Date() - new Date(otpRec.createdAt)) / 1000
                ),
              },
              responseStr.otp_sent_already
            );
          }
          return responseFn.error(res, {}, error.message, 500);
        });
    } else {
      return responseFn.error(res, {}, responseStr.record_not_found);
    }
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.body.phone });
    const otpRec = await Otp.findOne({ user: user._id });
    if (!otpRec) {
      return responseFn.error(res, {}, responseStr.otp_not_found);
    }
    if (appHelper.compareHash(req.body.code, otpRec.code)) {
      await User.updateOne(
        { _id: user._id },
        { password: appHelper.generateHash(req.body.password) }
      );
      await Otp.deleteOne({ _id: otpRec._id });
      return responseFn.success(res, {}, responseStr.password_reset_successful);
    } else {
      if (otpRec.attempts >= appConfig.passwordResetOtpAttepts - 1) {
        await Otp.deleteOne({ _id: otpRec._id });
        return responseFn.error(
          res,
          {},
          responseStr.too_many_attempts_to_reset_password
        );
      } else {
        await Otp.updateOne({ _id: otpRec._id }, { $inc: { attempts: 1 } });
        return responseFn.error(
          res,
          {
            attemptsLeft:
              appConfig.passwordResetOtpAttepts - (otpRec.attempts + 1),
          },
          responseStr.wrong_otp.replace(
            "{NUM}",
            appConfig.passwordResetOtpAttepts - (otpRec.attempts + 1)
          )
        );
      }
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
      .then(async (data) =>
        responseFn.success(res, {
          data: { ...data._doc, userType: "business" },
        })
      )
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
      .catch((error) => {
        if (error.code === 11000) {
          return responseFn.error(
            res,
            {},
            error.message.replace(/.*?({.*)/, "$1") + " already exists."
          );
        }
        responseFn.error(res, {}, error.message, 500);
      });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.updateBusiness = async (req, res) => {
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
    User.findOneAndUpdate({ _id: req.params._id }, req.body, { new: true })
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
      .catch((err) => {
        if (err.code === 11000) {
          return responseFn.error(
            res,
            {},
            err.message.replace(/.*?({.*)/, "$1") + " already exists."
          );
        }
        responseFn.error(res, {}, err.message, 500);
      });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.find = async (req, res) => {
  try {
    const conditions = {};
    if ("name" in req.query) {
      conditions.name = {
        $regex: req.query.name,
        $options: "i",
      };
    }
    if ("_id" in req.query && mongoose.isValidObjectId(req.query._id)) {
      conditions._id = req.query._id;
    }
    const attributes =
      req.authToken.userType === "admin"
        ? "-password -__v"
        : "username name motto phone email domain logo";
    User.find(conditions, attributes)
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.createBusiness = async (req, res) => {
  try {
    req.body.password = appHelper.generateHash(req.body.password);

    new User({ ...req.body })
      .save()
      .then(async (user) => {
        const config = await new Config({ user: user._id }).save();
        await Collection.insertMany(
          dbHelper.defaultSchemas.map((item) => ({ ...item, user: user._id }))
        );
        return responseFn.success(res, {
          data: { ...user._doc, password: undefined, __v: undefined, config },
        });
      })
      .catch((err) => {
        return responseFn.error(res, {}, err.message);
      });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
