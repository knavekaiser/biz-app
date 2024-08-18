import mongoose from "mongoose";
import { appConfig } from "../config/index.js";
import {
  appHelper,
  dbHelper,
  fileHelper,
  emailHelper,
} from "../helpers/index.js";
import { Company, Otp, Config, Collection, SubPlan } from "../models/index.js";

const { responseFn, responseStr } = appConfig;
const { genId } = appHelper;

export const signup = async (req, res) => {
  try {
    if (!req.body.phone && !req.body.email) {
      return responseFn.error(res, {}, "Email or Phone is required", 400);
    }
    req.body.password = appHelper.generateHash(req.body.password);

    const subPlan = await SubPlan.findOne({ name: "14 Days Trial" });
    if (subPlan) {
      req.body.subscription = {
        plan: subPlan._id,
        metadata: {
          startDate: new Date(),
          endDate: new Date().add(subPlan.duration + "D"),
        },
      };
    }

    new Company({
      ...req.body,
      chatbots: [
        {
          display_name: req.body.name,
          domain: null,
          primaryColor: null,
          avatar: null,
        },
      ],
    })
      .save()
      .then(async (user) => {
        await new Config({ user: user._id }).save();
        await Collection.insertMany(
          dbHelper.defaultSchemas.map((item) => ({ ...item, user: user._id }))
        );

        return appHelper.signIn(res, user._doc, "company");
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

    if (
      user &&
      appHelper.compareHash(req.body.password.toString(), user.password)
    ) {
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

export const forgotPassword = async (req, res) => {
  try {
    if (!req.body.phone && !req.body.email) {
      return responseFn.error(res, {}, "Email or Phone is required", 400);
    }
    const conditions = {};
    if (req.body.phone) {
      conditions.phone = req.body.phone;
    } else if (req.body.email) {
      conditions.email = req.body.email;
    }
    const user = await Company.findOne(conditions);

    if (user) {
      const otp = genId(6, { numbers: true });
      new Otp({
        user: user._id,
        code: appHelper.generateHash(otp),
      })
        .save()
        .then(async (otpRec) => {
          if (req.body.phone) {
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
          } else if (req.body.email) {
            emailHelper
              .sendEmail({
                to: user.email,
                templateName: "password_reset",
                values: {
                  "{USER_NAME}": user.name,
                  "{EXP}": `${appConfig.otpTimeout / 60} minutes`,
                  "{URL}":
                    req.headers.origin +
                    "/reset-password" +
                    "?token=" +
                    appHelper.encryptString(
                      `${user._id}-${otp}-${(
                        new Date().getTime() +
                        appConfig.otpTimeout * 1000
                      )
                        .toString(32)
                        .toUpperCase()}`
                    ),
                },
              })
              .then(async (data) => {
                if (data.success) {
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
                await Otp.deleteOne({ _id: otpRec._id });
                return responseFn.error(res, {}, responseStr.otp_sms_failed);
              });
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
              req.body.phone
                ? responseStr.otp_sent_already
                : responseStr.email_sent_already
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

export const validatePassToken = async (req, res) => {
  try {
    code = appHelper.decryptString(req.body.token);
    if (!code) {
      return responseFn.error(
        res,
        { type: "otp_expired" },
        responseStr.token_not_found,
        400
      );
    }
    let [_id, otp, exp] = code.split("-");
    const otpRec = await Otp.findOne({ user: _id });
    if (!otpRec) {
      return responseFn.error(
        res,
        { type: "otp_expired" },
        responseStr.token_not_found,
        400
      );
    }
    responseFn.success(res, {}, responseFn.token_valid);
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const resetPassword = async (req, res) => {
  try {
    if (!req.body.phone && !req.body.token) {
      return responseFn.error(res, {}, "Token or Phone is required", 400);
    }
    let user = null;
    let code = req.body.code || null;

    if (req.body.phone) {
      user = await Company.findOne({ phone: req.body.phone });
    } else if (req.body.token) {
      const _code = appHelper.decryptString(req.body.token);
      if (!_code) {
        return responseFn.error(
          res,
          { type: "otp_expired" },
          responseStr.token_not_found,
          400
        );
      }
      let [_id, otp, exp] = _code.split("-");
      user = await Company.findOne({ _id });
      code = otp;
    }
    const otpRec = await Otp.findOne({ user: user._id });
    if (!otpRec) {
      return responseFn.error(
        res,
        { type: "otp_expired" },
        req.body.phone
          ? responseStr.otp_not_found
          : responseStr.token_not_found,
        400
      );
    }

    if (appHelper.compareHash(code, otpRec.code)) {
      await Company.updateOne(
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
      domain: ".infinai.in",
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
    Company.findOne({ _id: req.authUser.id }, "-password -__v -updatedAt")
      .then(async (data) =>
        responseFn.success(res, {
          data: {
            ...data._doc,
            userType: "company",
            chatbot: data.chatbots?.[0] || null,
            chatbots: undefined,
          },
        })
      )
      .catch((error) => responseFn.error(res, {}, error.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (req.body.password) {
      if (
        appHelper.compareHash(
          req.body.oldPassword.toString(),
          req.authUser.password
        )
      ) {
        req.body.password = appHelper.generateHash(
          req.body.password.toString()
        );
      } else {
        return responseFn.error(
          res,
          { type: "cred_error" },
          responseStr.invalid_cred,
          400
        );
      }
    }
    const filesToDelete = [];
    if (req.body.logo && req.authUser.logo) {
      filesToDelete.push(req.authUser.logo);
    }
    if (req.body.ownerSignature) {
      if (req.authUser.ownerDetails.signature) {
        filesToDelete.push(req.authUser.ownerDetails.signature);
      }
      req.body.ownerDetails = {
        ...req.body.ownerDetails,
        signature: req.body.ownerSignature,
      };
    }
    if (req.body.chatbotDomain) {
      req.body.chatbots = [
        { ...req.authUser.chatbots?.[0]?._doc, domain: req.body.chatbotDomain },
      ];
    }
    Company.findOneAndUpdate({ _id: req.authUser._id }, req.body, { new: true })
      .then((data) => {
        fileHelper.deleteFiles(filesToDelete);
        responseFn.success(
          res,
          {
            data: {
              ...data._doc,
              password: undefined,
              __v: undefined,
              updatedAt: undefined,
              chatbot: data.chatbots?.[0] || null,
              chatbots: undefined,
            },
          },
          responseStr.record_updated
        );
      })
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

export const updateBusiness = async (req, res) => {
  try {
    const user = await Company.findOne({ _id: req.params._id });
    if (req.body.password) {
      req.body.password = appHelper.generateHash(req.body.password);
    }
    const filesToDelete = [];
    if (req.body.logo && user.logo) {
      filesToDelete.push(user.logo);
    }
    if (req.body.ownerSignature) {
      if (user.ownerDetails.signature) {
        filesToDelete.push(user.ownerDetails.signature);
      }
      req.body.ownerDetails = {
        ...req.body.ownerDetails,
        signature: req.body.ownerSignature,
      };
    }

    if (req.body.subPlan) {
      req.body.subscription = {
        plan: req.body.subPlan,
        metadata: {
          startDate: new Date(),
          endDate: null,
        },
      };
      delete req.body.subPlan;
    }
    if (req.body.chatbotDomain) {
      req.body.chatbots = [
        { ...user.chatbots?.[0]?._doc, domain: req.body.chatbotDomain },
      ];
    }

    Company.findOneAndUpdate({ _id: req.params._id }, req.body, { new: true })
      .then(async (data) => {
        const config = await Config.findOne({ user: data._id });
        let plan = null;
        if (data.subscription?.plan) {
          plan = await SubPlan.findOne({ _id: data.subscription.plan });
        }
        fileHelper.deleteFiles(filesToDelete);
        responseFn.success(
          res,
          {
            data: {
              ...data._doc,
              password: undefined,
              __v: undefined,
              updatedAt: undefined,
              config,
              subscription: { ...data.subscription, plan },
              chatbot: data.chatbots?.[0] || null,
              chatbots: undefined,
            },
          },
          responseStr.record_updated
        );
      })
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

export const find = async (req, res) => {
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

    const pipeline = [{ $match: conditions }];
    if (req.authToken.userType === "admin") {
      pipeline.push({ $project: { password: 0, __v: 0 } });
    } else {
      pipeline.push({
        $project: {
          username: 1,
          name: 1,
          motto: 1,
          phone: 1,
          email: 1,
          domain: 1,
          logo: 1,
          chatbots: 1,
        },
      });
    }

    pipeline.push(
      ...[
        { $addFields: { chatbot: { $first: "$chatbots" } } },
        { $unset: "chatbots" },
      ]
    );

    pipeline.push(
      ...[
        {
          $lookup: {
            from: "subscriptionplans",
            localField: "subscription.plan",
            foreignField: "_id",
            as: "subscription.plan",
          },
        },
        {
          $unwind: {
            path: "$subscription.plan",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]
    );

    pipeline.push(
      ...[
        {
          $lookup: {
            from: "configs",
            localField: "_id",
            foreignField: "user",
            as: "config",
          },
        },
        {
          $unwind: {
            path: "$config",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]
    );

    Company.aggregate(pipeline)
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const createBusiness = async (req, res) => {
  try {
    req.body.password = appHelper.generateHash(req.body.password);

    if (req.body.subPlan) {
      req.body.subscription = {
        plan: req.body.subPlan,
        metadata: {
          startDate: new Date(),
          endDate: null,
        },
      };
      delete req.body.subPlan;
    }

    new Company({
      ...req.body,
      chatbots: [
        {
          display_name: req.body.name,
          domain: null,
          primaryColor: null,
          avatar: null,
        },
      ],
    })
      .save()
      .then(async (user) => {
        const config = await new Config({ user: user._id }).save();
        await Collection.insertMany(
          dbHelper.defaultSchemas.map((item) => ({ ...item, user: user._id }))
        );
        let plan = null;
        if (user.subscription?.plan) {
          plan = await SubPlan.findOne({ _id: user.subscription.plan });
        }
        return responseFn.success(res, {
          data: {
            ...user._doc,
            password: undefined,
            __v: undefined,
            config,
            subscription: { ...user.subscription, plan },
            chatbot: user.chatbots?.[0] || null,
            chatbots: undefined,
          },
        });
      })
      .catch((err) => {
        return responseFn.error(res, {}, err.message);
      });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
