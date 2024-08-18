import { appConfig } from "../config/index.js";
import { appHelper } from "../helpers/index.js";
import { Admin, Otp, Company } from "../models/index.js";

const { responseFn, responseStr } = appConfig;
const { genId } = appHelper;

export const signup = async (req, res) => {
  try {
    req.body.password = appHelper.generateHash(req.body.password);

    new Admin({ ...req.body })
      .save()
      .then(async (user) => {
        return appHelper.signIn(res, user._doc, "admin");
      })
      .catch((err) => {
        return responseFn.error(res, {}, err.message);
      });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const login = async (req, res) => {
  try {
    const user = await Admin.findOne({ phone: req.body.phone });

    if (user && appHelper.compareHash(req.body.password, user.password)) {
      return appHelper.signIn(res, user._doc, "admin");
    } else {
      return responseFn.error(res, {}, responseStr.invalid_cred);
    }
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const user = await Admin.findOne({ phone: req.body.phone });

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

export const resetPassword = async (req, res) => {
  try {
    const user = await Admin.findOne({ phone: req.body.phone });
    const otpRec = await Otp.findOne({ user: user._id });
    if (!otpRec) {
      return responseFn.error(res, {}, responseStr.otp_not_found);
    }
    if (appHelper.compareHash(req.body.code, otpRec.code)) {
      await Admin.updateOne(
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

export const logout = async (req, res) => {
  try {
    res.cookie("access_token", "", {
      domain: process.env.COOKIE_DOMAIN,
      maxAge: 0, // 60 days
      httpOnly: true,
      sameSite: "Strict",
    });
    return responseFn.success(res, {});
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const switchAccount = async (req, res) => {
  try {
    if (!req.body.phone && !req.body.email) {
      return responseFn.error(res, {}, "Email or Phone is required", 400);
    }
    const condition = {};
    if (req.body.phone) {
      condition.phone = req.body.phone;
    } else if (req.body.email) {
      condition.email = req.body.email;
    }
    const user = await Company.findOne(condition);

    if (user) {
      return appHelper.signIn(res, user._doc, "company");
    } else {
      return responseFn.error(
        res,
        { type: "cred_error" },
        responseStr.invalid_cred,
        400
      );
    }
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const profile = (req, res) => {
  try {
    Admin.findOne({ _id: req.authUser.id }, "-password -__v -updatedAt")
      .then(async (data) =>
        responseFn.success(res, {
          data: { ...data._doc, userType: "admin" },
        })
      )
      .catch((error) => responseFn.error(res, {}, error.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const update = async (req, res) => {
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
    Admin.findOneAndUpdate({ _id: req.authUser._id }, req.body, { new: true })
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
