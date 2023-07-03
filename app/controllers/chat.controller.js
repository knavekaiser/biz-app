const {
  appConfig: { responseFn, responseStr },
} = require("../config");
const { aiHelper } = require("../helpers");

const { FaqDoc, Chat, SubPlan } = require("../models");
const { default: mongoose } = require("mongoose");

exports.getTopics = async (req, res) => {
  try {
    const topics = await FaqDoc.find({ user: req.business?._id || null });

    responseFn.success(res, { data: topics.map((item) => item.topic) });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.initChat = async (req, res) => {
  try {
    if (!req.body.topic && !req.body.url) {
      return responseFn.error(res, {}, responseStr.include_either_topic_or_url);
    }

    // get text content from documents
    let context = "";
    let topic = "";
    let error = "";
    let max_tokens = 100;

    if (req.body.topic) {
      const doc = await FaqDoc.findOne({ topic: req.body.topic });
      topic = doc.topic;

      context = await aiHelper.getContext({
        files: doc.files,
        urls: doc.urls,
      });
    } else if (req.body.url) {
      const result = await aiHelper.fetchContext(req.body.url);
      topic = result.topic || "certain document";
      error = result.error;
      context = result.content;
    }

    if (error || !context?.trim().length) {
      return responseFn.error(res, {}, error);
    }

    const tokenCount = await aiHelper.countToken(context);
    if (req.business?.subscription.plan) {
      const subPlan = await SubPlan.findOne({
        _id: req.business.subscription?.plan,
      });
      if (tokenCount > subPlan?.features.maxAiChatContextToken) {
        return responseFn.error(res, {});
      }
      if (subPlan?.maxAiChatToken) max_tokens = subPlan.maxAiChatToken;
    }

    const message = `You are an AI assistant here to help with ${topic} FAQs. You are equipped with knowledge about ${topic} to provide with accurate answers. If the question is not related to ${topic}, You will politely ask if I can help you with ${topic}. If the question is about ${topic}, You will use the given context to answer the question. In case the initial context doesn't cover the question, You will respond with "Sorry, I don't have the information you're looking for. Is there anything else I can help you with?". and keep the answers concise. and don't ask for context in the reply. keep in mind you are talking to the user/customer on behalf of the business.

Context: ${context}`;

    if (topic === "certain document") {
      topic = "URL";
    }

    const messages = [
      { role: "user", name: "System", content: message },
      {
        role: "user",
        name: "Guest",
        content: req.body.message,
      },
    ];

    aiHelper
      .generateResponse(messages, max_tokens)
      .then(async ({ message, usage }) => {
        messages[0].token = usage.prompt_tokens;
        message._id = mongoose.Types.ObjectId();
        message.token = usage.completion_tokens;
        messages.push(message);
        const chat = await new Chat({
          topic,
          url: req.body.url,
          business: req.business?._id,
          user: {
            name: req.body.name,
            email: req.body.email,
          },
          messages,
        }).save();
        return responseFn.success(res, {
          data: {
            _id: chat._id,
            user: chat.user,
            topic: chat.topic,
            url: chat.url,
            messages: chat.messages.filter((item) => item.name !== "System"),
          },
        });
      })
      .catch((err) => {
        console.log(err);
        responseFn.error(res, {});
      });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.getChat = async (req, res) => {
  try {
    Chat.findOne({ _id: req.params._id })
      .then((chat) =>
        responseFn.success(res, {
          data: {
            _id: chat._id,
            user: chat.user,
            topic: chat.topic,
            url: chat.url,
            messages: chat.messages.filter((item) => item.name !== "System"),
            createdAt: chat.createdAt,
          },
        })
      )
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.getChats = async (req, res) => {
  try {
    const conditions = {};
    if (["business", "staff"].includes(req.authToken.userType)) {
      conditions.business = req.business?._id || req.authUser._id;
    }

    Chat.aggregate([
      { $match: conditions },
      { $sort: { createdAt: -1 } },
      { $set: { tokenUsage: { $sum: "$messages.token" } } },
      {
        $lookup: {
          from: "users",
          let: { businessId: "$business" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$businessId"] } } },
            { $project: { _id: 1, name: 1, email: 1, phone: 1 } },
          ],
          as: "business",
        },
      },
      { $unwind: { path: "$business", preserveNullAndEmptyArrays: true } },
    ])
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params._id });
    const messageDate = new Date();

    let max_tokens = 100;

    if (req.business?.subscription.plan) {
      await SubPlan.findOne({ _id: req.business.subscription.plan }).then(
        (subPlan) => {
          if (subPlan?.maxAiChatToken) max_tokens = subPlan.maxAiChatToken;
        }
      );
    }

    aiHelper
      .generateResponse(
        [
          ...chat.messages.map((item) => ({
            role: item.role,
            name: item.name,
            content: item.content,
          })),
          {
            role: "user",
            name: "Guest",
            content: req.body.content,
          },
        ],
        max_tokens
      )
      .then(async ({ message, usage }) => {
        message._id = mongoose.Types.ObjectId();
        message.createdAt = messageDate;
        message.updatedAt = messageDate;
        await Chat.updateOne(
          { _id: req.params._id },
          {
            $push: {
              messages: {
                $each: [
                  {
                    role: "user",
                    name: "Guest",
                    content: req.body.content,
                    token: usage.prompt_tokens,
                  },
                  { ...message, token: usage.completion_tokens },
                ],
              },
            },
          }
        );
        return responseFn.success(res, { data: message });
      })
      .catch((err) => {
        console.log(err);
        responseFn.error(res, {});
      });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.vote = async (req, res) => {
  try {
    Chat.updateOne(
      {
        _id: req.params.chat_id,
        "messages._id": req.params.message_id,
      },
      { $set: { "messages.$.like": req.body.like } }
    )
      .then((data) => {
        if (data.modifiedCount) {
          return responseFn.success(res, {});
        }

        return responseFn.error(res, {}, responseStr.record_not_found);
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.delete = async (req, res) => {
  try {
    if (!req.params._id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    Chat.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params._id] },
      user: req.business?._id || req.authUser._id,
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
