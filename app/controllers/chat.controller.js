const {
  appConfig: { responseFn, responseStr },
} = require("../config");
const { aiHelper } = require("../helpers");

const { FaqDoc, Chat, SubPlan } = require("../models");
const { default: mongoose } = require("mongoose");

exports.getTopics = async (req, res) => {
  try {
    const topics = await FaqDoc.find({
      user: req.business?._id || null,
      showOnChat: true,
    });

    responseFn.success(res, { data: topics.map((item) => item.topic) });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.initChat = async (req, res) => {
  try {
    if (!req.body.topic) {
      const availableTopics = await FaqDoc.find({ user: req.business._id });
      if (availableTopics.length === 0) {
        return responseFn.error(
          res,
          {},
          responseStr.error_occurred_contact_support
        );
      }
      req.body.topic = await aiHelper.getTopic({
        topics: availableTopics,
        message: req.body.message,
      });
    }

    // get text content from documents
    let doc = await FaqDoc.findOne({ topic: req.body.topic });
    let context = "";
    let topic = doc.topic;
    let max_tokens = 100;
    let messages = [];
    let parentDoc = req.body.parentTopic
      ? await FaqDoc.findOne({ topic: req.body.parentTopic })
      : null;

    let resp = null;

    if (req.business?.subscription.plan) {
      const subPlan = await SubPlan.findOne({
        _id: req.business.subscription?.plan,
      });
      if (doc.tokenCount > subPlan?.features.maxAiChatContextToken) {
        return responseFn.error(
          res,
          {},
          responseStr.error_occurred_contact_support
        );
      }
      if (subPlan?.maxAiChatToken) max_tokens = subPlan.maxAiChatToken;
    }

    if (doc.tokenCount < 4000) {
      context = await aiHelper.getContext({
        files: doc.files,
        urls: doc.urls,
      });
      messages = [
        {
          role: "user",
          name: "System",
          content: `You are an AI assistant here to help with ${topic} FAQs. You are equipped with knowledge about ${topic} to provide with accurate answers. If the question is not related to ${topic}, You will politely ask if I can help you with ${topic}. If the question is about ${topic}, You will use the given context to answer the question. In case the initial context doesn't cover the question, You will respond with "Sorry, I don't have the information you're looking for. Is there anything else I can help you with?".
        context may contain JSON data. in such case, you are to analyze that data and answer questions like "Give me the total number of sale", "Give me the first and last dates in the dataset", "Give me the highest spending user" etc. (keep in mind the data may be about anything. not just sales).
        keep the answers concise. and don't ask for context in the reply. keep in mind you are talking to the user/customer on behalf of the business.
        
        Context: ${context}`,
        },
        {
          role: "user",
          name: "Guest",
          content: req.body.message,
        },
      ];

      if (!context?.trim().length) {
        return responseFn.error(res, {});
      }
      resp = await aiHelper.generateResponse(messages, max_tokens);
    } else {
      messages = [
        {
          role: "user",
          name: "System",
          content: `You are an AI assistant here to help with ${topic} FAQs. You will be provided with the context along with the question. answer it honestly, accurately based on the given context. If the question is not related to ${topic}, You will politely ask if I can help you with ${topic}. If the question is about ${topic}, You will use the given context to answer the question. If the given context does not inlcude enough infromation to answer the question, You will respond with "Sorry, I don't have the information you're looking for. Is there anything else I can help you with?".
  context may contain JSON data. in such case, you are to analyze that data and answer questions like "Give me the total number of sale", "Give me the first and last dates in the dataset", "Give me the highest spending user" etc. (keep in mind the data may be about anything. not just about sales).
  keep the answers concise. and don't ask for context in the reply. keep in mind you are talking to the user/customer on behalf of the business.`,
        },
        ...(await aiHelper.getPartialContext({
          userId: doc.user,
          topicId: doc._id,
          msg: req.body.message,
        })),
      ];
      // console.log(messages);
      // return responseFn.error(res, {}, "testing");
      resp = await aiHelper.generateResponse(messages, max_tokens);
    }

    if (resp) {
      const { message, usage } = resp;
      messages[0].token = usage.prompt_tokens;
      message._id = mongoose.Types.ObjectId();
      message.token = usage.completion_tokens;
      messages.push(message);

      const chat = await new Chat({
        topic,
        faqDoc: doc._id,
        ...(parentDoc && {
          parentTopic: parentDoc.topic,
          parentFaqDoc: parentDoc._id,
        }),
        business: req.business?._id,
        fullContext: doc.tokenCount < 4000,
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
          ...(chat.parentTopic
            ? { topic: chat.parentTopic, subTopic: chat.topic }
            : { topic: chat.topic }),
          messages: chat.messages.filter((item) => item.name !== "System"),
        },
      });
    }
    responseFn.error(res, {});
  } catch (error) {
    console.log(error);
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.getChat = async (req, res) => {
  try {
    Chat.findOne({ _id: req.params._id })
      .then((chat) =>
        chat
          ? responseFn.success(res, {
              data: {
                _id: chat._id,
                user: chat.user,
                ...(chat.parentTopic
                  ? { topic: chat.parentTopic, subTopic: chat.topic }
                  : { topic: chat.topic }),
                messages: chat.messages.filter(
                  (item) => item.name !== "System"
                ),
                createdAt: chat.createdAt,
              },
            })
          : responseFn.error(
              res,
              {},
              responseStr.record_not_found.replace("Record", "Chat")
            )
      )
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.getChats = async (req, res) => {
  try {
    let { page, pageSize } = req.query;
    page = +page;
    pageSize = +pageSize;

    const conditions = {};
    if (["business", "staff"].includes(req.authToken.userType)) {
      conditions.business = req.business?._id || req.authUser._id;
    }
    if (req.query.topic) {
      conditions.topic = { $regex: req.query.topic, $options: "i" };
    }

    const pipeline = [
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
    ];

    if (page && pageSize) {
      pipeline.push({
        $facet: {
          records: [{ $skip: pageSize * (page - 1) }, { $limit: pageSize }],
          metadata: [{ $group: { _id: null, total: { $sum: 1 } } }],
        },
      });
    }

    Chat.aggregate(pipeline)
      .then((data) =>
        responseFn.success(
          res,
          page && pageSize
            ? {
                data: data[0].records,
                metadata: {
                  ...data[0].metadata[0],
                  _id: undefined,
                  page,
                  pageSize,
                },
              }
            : { data }
        )
      )
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

    let resp = null;
    let messages = [];

    if (chat.fullContext) {
      resp = await aiHelper.generateResponse(
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
      );
    } else {
      messages = await aiHelper.getPartialContext({
        userId: chat.business,
        topicId: chat.faqDoc,
        msg:
          chat.messages
            .filter((msg) => msg.name === "Guest")
            .slice(-5)
            .map((msg) => msg.content)
            .join("\n") +
          "\n" +
          req.body.content,
      });
      resp = await aiHelper.generateResponse(
        [
          ...chat.messages.map((item) => ({
            role: item.role,
            name: item.name,
            content: item.content,
          })),
          ...messages,
        ],
        max_tokens
      );
    }

    if (resp) {
      const { message, usage } = resp;
      message._id = mongoose.Types.ObjectId();
      message.createdAt = messageDate;
      message.updatedAt = messageDate;

      if (messages.length) {
        messages[messages.length - 1].token = usage.prompt_tokens;
        messages.push({ ...message, token: usage.completion_tokens });
      }

      const msgs = chat.fullContext
        ? [
            {
              role: "user",
              name: "Guest",
              content: req.body.content,
              token: usage.prompt_tokens,
            },
            { ...message, token: usage.completion_tokens },
          ]
        : messages;
      await Chat.updateOne(
        { _id: req.params._id },
        { $push: { messages: { $each: msgs } } }
      );
      return responseFn.success(res, { data: message });
    }

    responseFn.error(res, {});
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
      business: req.business?._id || req.authUser._id,
    })
      .then((data) => {
        if (data.deletedCount) {
          responseFn.success(res, {}, responseStr.record_deleted);
        } else {
          responseFn.error(res, {}, responseStr.record_not_deleted);
        }
      })
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
