const {
  appConfig: { responseFn, responseStr },
} = require("../config");
const { ObjectId } = require("mongodb");

const { User } = require("../models");

exports.getChatbot = async (req, res) => {
  try {
    return responseFn.success(res, {
      data:
        req.business.chatbots?.find(
          (bot) => bot._id.toString() === req.params.chatbot_id.toString()
        ) || null,
    });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.getChatbots = async (req, res) => {
  try {
    if (req.authToken.userType === "business") {
      return responseFn.success(res, {
        data: req.authUser.chatbots?.[0] || null,
      });
    }
    if (req.authToken.userType === "staff") {
      return responseFn.success(res, {
        data: req.business.chatbots?.[0] || null,
      });
    }
    User.aggregate([
      {
        $unwind: {
          path: "$chatbots",
          preserveNullAndEmptyArrays: false,
        },
      },
    ])
      .then((chatbots) => responseFn.success(res, { data: chatbots }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.updateChatbot = async (req, res) => {
  try {
    const condition = { "chatbots._id": ObjectId(req.params._id) };
    if (req.authToken.userType === "business") {
      condition.user = req.authUser._id;
    }
    if (req.authToken.userType === "staff") {
      condition.user = req.business._id;
    }
    const updates = {};
    ["domain", "primaryColor", "showTopic"].forEach((key) => {
      if (key in req.body) {
        updates[`chatbots.$.${key}`] = req.body[key];
      }
    });
    User.findOneAndUpdate(condition, { $set: updates }, { new: true })
      .then((data) => {
        return responseFn.success(res, { data: data.chatbots[0] });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    console.log(error);
    return responseFn.error(res, {}, error.message, 500);
  }
};
