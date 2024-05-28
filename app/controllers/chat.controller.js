const {
  appConfig: { responseFn, responseStr },
} = require("../config");
const { aiHelper, dbHelper } = require("../helpers");

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

exports.initChatOld = async (req, res) => {
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

exports.initChat = async (req, res) => {
  try {
    let messages = [];

    let resp = null;

    const { Model: ProductModel } = await dbHelper.getModel(
      req.business._id + "_" + "Product"
    );
    const { Model: CategoryModel } = await dbHelper.getModel(
      req.business._id + "_" + "Category"
    );
    const { Model: SubcategoryModel } = await dbHelper.getModel(
      req.business._id + "_" + "Subcategory"
    );
    if (!ProductModel)
      return responseFn.error(res, {}, responseStr.record_not_found);

    const product = await ProductModel.findOne();

    const prompt = `You are an AI assistant embedded within an e-commerce site. Your role is to help the user find what they looking for. Within this application, each Product possesses essential fields including ${Object.keys(
      product?._doc || {}
    ).join(", ")}. Here's what you are tasked to do:

Offer pertinent information about the product upon request. For instance:
a. Show me 5 green shirts.
b. Show me few shirts under $500.

When unable to provide an answer due to insufficient data, respond with JSON to run automated actions so you can get the data required to perform the analysis effectively.

Here's an example of a Product:-
${JSON.stringify(product._doc, null, 2)}

Please note that the following example serves solely to illustrate the document structure. Avoid utilizing any of these specific values for queries or any other purposes.

Possible product categories are:
${await CategoryModel.find().then((data) =>
  data
    .map(
      (cat, i) =>
        `${i + 1}. ${JSON.stringify({ _id: cat._id, name: cat.name })}`
    )
    .join("\n")
)}

Possible product subcategories are:
${await SubcategoryModel.find().then((data) =>
  data
    .map(
      (subcat, i) =>
        `${i + 1}. ${JSON.stringify({
          _id: subcat._id,
          category: subcat.category,
          name: subcat.name,
        })}`
    )
    .join("\n")
)}


Please respond exclusively in JSON to execute predefined actions when data retrieval from the database is necessary for context or response. For instance, if asked "show me some shirts within $500", respond with valid JSON, similar to the following example:
{ 
  "response_type": "action",
  "action": "Get Products",
  "pipeline": [
    {
      "$match": {
        "$expr": {
          "$and": [
            {
              "$lte": [ "$price", 500 ]
            }
          ]
        }
      }
    }
  ]
}.

Please follow these rules when crafting action responses to ensure that your response is perfectly stringifiable and parsable:
1. Refrain from utilizing inline functions such as ISODate(), Date(), or ObjectId(). Instead, opt for suitable operators like $dateFromString or $toObjectId.
2. If you need to perform a mathematical equation in the query, such as for date comparisons, please use MongoDB operators like $add, $subtract, $multiply, etc. Do not pass mathematical equations directly like this '{ "$subtract": [ "$$NOW", 60 * 60 * 24 * 7 * 1000 * 3 ] }', as '60 * 60 * 24 * 7 * 1000 * 3' are not valid JSON, just write 1814400000 instead.
3. Abstain from employing $lookup, as all 'foreign fields' will already be populated.
4. Do not use following operators in the pipeline: $nin.
5. Whenever querying any name, make sure the query is case-insensitive.
6. The whole response must be valid JSON. Do not include any sort of explanation in the response. Keep it mind, the response will automatically be parsed and ran as queries.
7. Never mix explanation and JSON in the same response.
8. Never include python, javascript or any programming language code and or instruction in the response.


Here are the available actions:
1. "Get Products" - This is to be used to retrieve products for auditional context when answering a query.
2. "List Products" - This is to be used when showing users a list of products.

Once you retrieve products with "List Products", your response must in the following format:
{
  "response_type": "product_list",
  "products": [
    {
      "_id": "663ed07469a2e5a55bb64d80",
      "title": "T-shirt",
      "description": "a red t-shirt",
      "images": [
        "/assets/uploads/dynamicTables/Product_6633991d8fe77e687bfc3e99/663ed07469a2e5a55bb64d7e.webp"
      ],
      "price": 500
    },
    {
      "_id": "663ed09969a2e5a55bb64da0",
      "title": "Frok",
      "description": "a blue frok",
      "images": [
        "/assets/uploads/dynamicTables/Product_6633991d8fe77e687bfc3e99/663ed09969a2e5a55bb64d9e.webp",
        "/assets/uploads/dynamicTables/Product_6633991d8fe77e687bfc3e99/665413d7a02ca691cc11ff5d.webp"
      ],
      "price": 1200
    }
  ],
  "message": "We have these two shirts just for you."
}

If the query is vague due to the user not mentioning any specific category or subcategory, you can politely ask the user to specify the category or subcategory.

If the system returns an empty array, tell the user that no products were found. Never say "As an AI, I don't have the necessary information to answer that".
`;

    messages = [
      {
        role: "user",
        name: "System",
        content: prompt,
      },
      {
        role: "user",
        name: "System",
        content: `Todays Date: ${new Date().toISOString()}`,
      },
      {
        role: "user",
        name: "Guest",
        content: req.body.message,
      },
    ];

    resp = await aiHelper.generateResponse(messages, {
      business: req.business,
    });

    if (resp) {
      const { message, usage } = resp;
      messages[0].token = usage.prompt_tokens;
      message._id = mongoose.Types.ObjectId();
      message.token = usage.completion_tokens;
      message.action = "data" in resp;
      messages.push(message);

      const title = await aiHelper
        .generateResponse(
          [
            {
              role: "user",
              name: "System",
              content: `You are an AI integrated in an e-commerce app. You are to generate a 3 word chat title based on the following question: ${req.body.message}.

Respond with the title only, no extra text whatsoever. don't put quotes around the title.`,
            },
          ],
          100,
          { company: req.company || req.authUser, module }
        )
        .then((resp) => resp?.message?.content || null);

      let chat = await new Chat({
        title,
        fullContext: true,
        user: {
          name: req.body.name,
          email: req.body.email,
        },
        business: req.business?._id,
        messages,
      }).save();

      if ("data" in resp) {
        const newMessages = [
          {
            role: "user",
            name: "System",
            content: JSON.stringify(resp.data),
          },
        ];
        resp = await aiHelper.generateResponse(
          [...messages, ...newMessages].map((msg) => ({
            role: msg.role,
            name: msg.name,
            content: msg.content,
          })),
          { business: req.business }
        );
        const { message, usage } = resp;
        message._id = mongoose.Types.ObjectId();
        message.createdAt = new Date();
        message.updatedAt = new Date();

        if (newMessages.length) {
          newMessages[newMessages.length - 1].token = usage.prompt_tokens;
          newMessages.push({ ...message, token: usage.completion_tokens });
        }

        await Chat.updateOne(
          { _id: chat._id },
          { $push: { messages: { $each: newMessages } } }
        );

        chat = await Chat.findOne({ _id: chat._id });
      }
      return responseFn.success(res, {
        data: {
          _id: chat._id,
          user: chat.user,
          title: chat.title,
          ...(chat.parentTopic
            ? { topic: chat.parentTopic, subTopic: chat.topic }
            : { topic: chat.topic }),
          messages: chat.messages.filter(
            (item) => !(item.name === "System" || item.action)
          ),
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
                title: chat.title,
                _id: chat._id,
                user: chat.user,
                ...(chat.parentTopic
                  ? { topic: chat.parentTopic, subTopic: chat.topic }
                  : { topic: chat.topic }),
                messages: chat.messages.filter(
                  (item) => !(item.name === "System" || item.action)
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
          ...chat.messages
            .filter((msg) => !msg.content.startsWith("Todays Date: "))
            .map((item) => ({
              role: item.role,
              name: item.name,
              content: item.content,
            })),
          {
            role: "user",
            name: "System",
            content: `Todays Date: ${new Date().toISOString()}`,
          },
          {
            role: "user",
            name: "Guest",
            content: req.body.content,
          },
        ],
        { business: req.business }
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
        { business: req.business }
      );
    }

    if (resp) {
      let { message, usage } = resp;
      message._id = mongoose.Types.ObjectId();
      message.createdAt = messageDate;
      message.updatedAt = messageDate;
      message.action = "data" in resp;

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

      const newMessages = [];

      if ("data" in resp) {
        newMessages.push({
          role: "user",
          name: "System",
          content: JSON.stringify(resp.data),
        });
        resp = await aiHelper.generateResponse(
          [...msgs, ...newMessages].map((msg) => ({
            role: msg.role,
            name: msg.name,
            content: msg.content,
          })),
          max_tokens,
          { company: req.company || req.authUser, module }
        );
        const { message: newMsg, usage } = resp;
        newMsg._id = mongoose.Types.ObjectId();
        newMsg.createdAt = new Date();
        newMsg.updatedAt = new Date();

        if (newMessages.length) {
          newMessages[newMessages.length - 1].token = usage.prompt_tokens;
          newMessages.push({ ...newMsg, token: usage.completion_tokens });
        }

        message = newMsg;
      }

      await Chat.updateOne(
        { _id: req.params._id },
        { $push: { messages: { $each: [...msgs, ...newMessages] } } }
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
