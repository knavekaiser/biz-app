import { appConfig } from "../config/index.js";
import { ObjectId } from "mongodb";

import { Company, FaqDoc } from "../models/index.js";
import { fileHelper } from "../helpers/index.js";

const { responseFn, responseStr } = appConfig;

export const getChatbot = async (req, res) => {
  try {
    const topics = await FaqDoc.aggregate([
      {
        $match: {
          user: req.business._id,
          showOnChat: true,
          parentTopic: null,
        },
      },
      {
        $lookup: {
          from: "faq documents",
          localField: "_id",
          foreignField: "parentTopic",
          as: "subTopics",
        },
      },
      {
        $set: {
          subTopics: {
            $map: {
              input: "$subTopics",
              as: "subTopic",
              in: {
                _id: "$$subTopic._id",
                contextForUsers: "$$subTopic.contextForUsers",
                topic: "$$subTopic.topic",
                paths: "$$subTopic.paths",
              },
            },
          },
        },
      },
    ]);
    const chatbot = req.business.chatbots?.[0]?._doc || null;
    if (!chatbot) {
      return responseFn.error(
        res,
        {},
        responseStr.record_not_found.replace("Record", "Chatbot")
      );
    }
    return responseFn.success(res, {
      data: {
        ...chatbot,
        topics: topics.map((item) => ({
          _id: item._id,
          topic: item.topic,
          contextForUsers: item.contextForUsers,
          paths: item.paths,
          subTopics: item.subTopics,
        })),
      },
    });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const getChatbotByDomain = async (req, res) => {
  try {
    const chatbot = await Company.aggregate([
      { $match: { "chatbots.domain": req.params.domain } },
    ]).then(
      ([business]) =>
        business?.chatbots?.find((item) => item.domain === req.params.domain) ||
        null
    );

    if (chatbot) {
      return responseFn.success(res, {
        data: chatbot,
      });
    }
    return responseFn.error(
      res,
      {},
      responseStr.record_not_found.replace("Record", "Chatbot")
    );
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const getChatbots = async (req, res) => {
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
    Company.aggregate([
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

export const updateChatbot = async (req, res) => {
  try {
    const condition = { "chatbots._id": ObjectId(req.params._id) };
    if (req.authToken.userType === "business") {
      condition.user = req.authUser._id;
    }
    if (req.authToken.userType === "staff") {
      condition.user = req.business._id;
    }
    const updates = {};
    [
      "domain",
      "primaryColor",
      "showTopic",
      "avatar",
      "display_name",
      "autoOpenAfter",
    ].forEach((key) => {
      if (key in req.body) {
        if (key === "avatar") {
          updates[`chatbots.$.${key}`] = req.body[key]?.url || req.body[key];
          return;
        }
        updates[`chatbots.$.${key}`] = req.body[key];
      }
    });
    const chatbot = await Company.findOne(
      { "chatbots._id": req.params._id },
      { "chatbots.$": 1 }
    ).then((user) => user?.chatbots?.[0]);
    const filesToDelete = [];
    if (req.files?.avatar?.length && chatbot?.avatar) {
      filesToDelete.push(chatbot.avatar);
    } else if (req.body.avatar === null && chatbot?.avatar) {
      filesToDelete.push(chatbot.avatar);
    }
    Company.findOneAndUpdate(condition, { $set: updates }, { new: true })
      .then((data) => {
        responseFn.success(res, { data: data.chatbots[0] });
        if (filesToDelete?.length) {
          fileHelper.deleteFiles(filesToDelete);
        }
      })
      .catch((err) => {
        responseFn.error(res, {}, err.message);
        if (req.files) {
          fileHelper.deleteFiles(
            Object.values(req.files)
              .flat()
              .map((item) => item.path)
          );
        }
      });
  } catch (error) {
    console.log(error);
    responseFn.error(res, {}, error.message, 500);
    if (req.files) {
      fileHelper.deleteFiles(
        Object.values(req.files)
          .flat()
          .map((item) => item.path)
      );
    }
  }
};
