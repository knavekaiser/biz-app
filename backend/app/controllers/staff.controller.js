import { appConfig } from "../config/index.js";
import { appHelper } from "../helpers/index.js";
import { Staff, Otp, Config, getModel } from "../models/index.js";

const { responseFn, responseStr } = appConfig;
const { genId } = appHelper;

export const signup = async (req, res) => {
  try {
    req.body.password = appHelper.generateHash(req.body.password);

    new Staff({ ...req.body })
      .save()
      .then(async (staff) => {
        return appHelper.signIn(res, staff._doc, "staff");
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
    const staff = await Staff.findOne({ phone: req.body.phone })
      .populate("businesses.business", "name email phone profile logo")
      .populate("businesses.roles", "name permissions");

    if (staff && appHelper.compareHash(req.body.password, staff.password)) {
      let businesses = null;
      if (staff.businesses.length) {
        businesses = await Config.find({
          user: { $in: staff.businesses.map((item) => item.business._id) },
        }).then((configs) => {
          return staff.businesses.map((item) => ({
            ...item._doc,
            config: configs.find(
              (config) =>
                config.user.toString() === item.business._id.toString()
            ),
          }));
        });
      }
      return appHelper.signIn(
        res,
        { ...staff._doc, businesses: businesses || staff.businesses },
        "staff"
      );
    } else {
      return responseFn.error(res, {}, responseStr.invalid_cred);
    }
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const staff = await Staff.findOne({ phone: req.body.phone });

    if (staff) {
      const otp = genId(6, { numbers: true });
      new Otp({
        user: staff._id,
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
                  phone: staff.phone,
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
            const otpRec = await Otp.findOne({ user: staff._id });

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
    const staff = await Staff.findOne({ phone: req.body.phone });
    const otpRec = await Otp.findOne({ user: staff._id });
    if (!otpRec) {
      return responseFn.error(res, {}, responseStr.otp_not_found);
    }
    if (appHelper.compareHash(req.body.code, otpRec.code)) {
      await Staff.updateOne(
        { _id: staff._id },
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

export const profile = (req, res) => {
  try {
    Staff.findOne({ _id: req.authUser.id }, "-password -__v -updatedAt")
      .populate("businesses.business", "name email phone profile logo")
      .populate("businesses.roles", "name permissions")
      .then(async (data) => {
        let businesses = null;
        if (data.businesses.length) {
          const allConfigs = await Config.find({
            user: { $in: data.businesses.map((item) => item.business._id) },
          });
          const allFinPeriod = await Promise.all(
            data.businesses.map(async (business) => {
              const FinPeriod = getModel({
                companyId: business._id,
                name: "FinancialPeriod",
              });
              return FinPeriod.find().then((data) =>
                data.map((item) => ({
                  ...item.toJSON(),
                  company: business._id,
                }))
              );
            })
          ).then((data) => data.flat());
          businesses = data.businesses.map((item) => ({
            ...item._doc,
            config: allConfigs.find(
              (config) =>
                config.user.toString() === item.business._id.toString()
            ),
            finPeriods: allFinPeriod.filter(
              (item) => item.company.toString() === item.business._id.toString()
            ),
          }));
        }
        responseFn.success(res, {
          data: {
            ...data._doc,
            businesses: businesses || data.businesses,
            userType: "staff",
          },
        });
      })
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
    Staff.findOneAndUpdate({ _id: req.authUser._id }, req.body, { new: true })
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

export const findAll = async (req, res) => {
  try {
    Staff.find({})
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
