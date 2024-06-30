import { appConfig } from "../config/index.js";
import { aiHelper, dbHelper } from "../helpers/index.js";
import { FaqDoc, Chat, SubPlan } from "../models/index.js";
import { pipeline } from "node:stream/promises";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const { responseFn, responseStr } = appConfig;

export const getTopics = async (req, res) => {
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

export const initChat = async (req, res) => {
  try {
    let messages = [];

    const { Model: ProductModel } = await dbHelper.getModel(
      req.business._id + "_" + "Product"
    );
    const { Model: CategoryModel } = await dbHelper.getModel(
      req.business._id + "_" + "Category"
    );
    if (!ProductModel)
      return responseFn.error(res, {}, responseStr.record_not_found);

    const product = await ProductModel.findOne();

    const prompt = `You are an AI assistant embedded within an e-commerce site. Your role is to help the user find what they looking for. Within this application, each Product possesses essential fields including ${Object.keys(
      product?._doc || {}
    )
      .filter(
        (key) =>
          ![
            "__v",
            "createdAt",
            "updatedAt",
            "images",
            "whatsappNumber",
          ].includes(key)
      )
      .join(
        ", "
      )}. Your task is to help users find what they are looking for based on their queries. For instance, a user may ask:
a. I'm looking for something for my wife to wear. she likes red and sparkly things.
b. Can you suggest something for me to wear to a meeting this evening?

You will perform appropiate actions to answer correctly.

Here's an example of a Product:-
${JSON.stringify(
  Object.entries(product._doc)
    .filter(
      (key) =>
        !["__v", "createdAt", "updatedAt", "images", "whatsappNumber"].includes(
          key
        )
    )
    .reduce((p, [k, v]) => {
      p[k] = v;
      return p;
    }, {}),
  null,
  2
)}

Please note that the following example serves solely to illustrate the document structure. Avoid utilizing any of these specific values for queries or any other purposes.

Possible product categories and subcategories are:
${await CategoryModel.aggregate([
  {
    $lookup: {
      from: `${req.business._id}_Subcategory`,
      localField: "name",
      foreignField: "category",
      as: "subcategories",
    },
  },
]).then((data) =>
  data
    .map(
      (cat, i) =>
        `${i + 1}. ${JSON.stringify({ _id: cat._id, name: cat.name })}
  Subcateries:
${cat.subcategories
  .map(
    (subcat) => "\t" + JSON.stringify({ _id: subcat._id, name: subcat.name })
  )
  .join("\n")}`
    )
    .join("\n")
)}

Once you retrieve products, the response MUST adhere to this specific structure, with nothing preceding or following:
{
  "response_type": "product_list",
  "products": [
    {
      "_id": "663ed07469a2e5a55bb64d80",
      "title": "T-shirt",
      "images": [
        "/assets/uploads/dynamicTables/Product_3469991d8fe77e627bfc3e99/663ed07469a2e5a55bb64d7e.webp"
      ],
      "price": 500
    },
    {
      "_id": "663ed09969a2e5a55bb64da0",
      "title": "Frok",
      "description": "a blue frok",
      "images": [
        "/assets/uploads/dynamicTables/Product_3469991d8fe77e627bfc3e99/663ed09969a2e5a55bb64d9e.webp",
        "/assets/uploads/dynamicTables/Product_3469991d8fe77e627bfc3e99/665413d7a02ca691cc11ff5d.webp"
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
        role: "system",
        content: prompt,
      },
      {
        role: "system",
        content: `Business ID: ${req.business._id}`,
      },
      {
        role: "system",
        content: `Todays Date: ${new Date().toISOString()}`,
      },
    ];

    const title = await aiHelper
      .generateResponse({
        message: `You are an AI integrated in an e-commerce app. You are to generate a 3 word chat title based on the following question: ${req.body.message}.

Respond with the title only, no extra text whatsoever. don't put quotes around the title.`,
        metadata: { company: req.company || req.authUser },
        stream: false,
      })
      .then((resp) => resp?.output || null);

    let chat = await new Chat({
      title,
      fullContext: true,
      user: {
        name: req.body.name,
        email: req.body.email,
      },
      business: req.business?._id,
      messages: [...messages, { role: "user", content: req.body.message }],
    }).save();

    let fullResponse = "";

    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });
    const newMessageId = new ObjectId();
    let firstBitSent = false;
    await aiHelper
      .generateResponse({
        history: messages,
        message: req.body.message,
        stream: true,
        metadata: { business: req.business },
      })
      .then(async (stream) => {
        if (stream) {
          for await (const event of stream) {
            const eventType = event.event;
            if (eventType === "on_llm_stream") {
              const content = event.data?.chunk?.message?.content;
              if (content !== undefined && content !== "") {
                fullResponse += content;
                if (!firstBitSent) {
                  res.write(
                    JSON.stringify({
                      _id: chat._id,
                      user: chat.user,
                      title: chat.title,
                      ...(chat.parentTopic
                        ? { topic: chat.parentTopic, subTopic: chat.topic }
                        : { topic: chat.topic }),
                      messages: [
                        ...chat.messages.filter(
                          (item) => !(item.role === "system" || item.action)
                        ),
                        {
                          _id: newMessageId,
                          role: "assistant",
                          createdAt: new Date(),
                          updatedAt: new Date(),
                          content,
                        },
                      ],
                    }) + "___msgEnd___"
                  );
                  firstBitSent = true;
                } else {
                  res.write(
                    JSON.stringify({
                      _id: newMessageId,
                      // role: "assistant",
                      content,
                    }) + "___msgEnd___"
                  );
                }
              }
            }
          }
        }
      });
    res.end();

    await Chat.findOneAndUpdate(
      { _id: chat._id },
      {
        $push: {
          messages: {
            _id: newMessageId,
            role: "assistant",
            content: fullResponse,
          },
        },
      }
    );
  } catch (error) {
    console.log(error);
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const getChat = async (req, res) => {
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
                  (item) => !(item.role === "system" || item.action)
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

export const getChats = async (req, res) => {
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

export const sendMessage = async (req, res) => {
  try {
    let chat = await Chat.findOne({ _id: req.params._id });

    if (req.business?.subscription.plan) {
      await SubPlan.findOne({ _id: req.business.subscription.plan }).then(
        (subPlan) => {
          if (subPlan?.maxAiChatToken) max_tokens = subPlan.maxAiChatToken;
        }
      );
    }

    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });
    const newMessageId = new ObjectId();
    let fullResponse = "";
    let firstBitSent = false;
    await aiHelper
      .generateResponse({
        history: [
          ...chat.messages
            .filter((msg) => !msg.content.startsWith("Todays Date: "))
            .map((item) => ({
              role: item.role,
              content: item.content,
            })),
          {
            role: "user",
            name: "system",
            content: `Todays Date: ${new Date().toISOString()}`,
          },
        ],
        message: req.body.content,
        stream: true,
        metadata: { business: req.business },
      })
      .then(async (stream) => {
        if (stream) {
          for await (const event of stream) {
            const eventType = event.event;
            if (eventType === "on_llm_stream") {
              const content = event.data?.chunk?.message?.content;
              if (content !== undefined && content !== "") {
                fullResponse += content;
                if (!firstBitSent) {
                  res.write(
                    JSON.stringify({
                      _id: newMessageId,
                      role: "assistant",
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      content,
                    }) + "___msgEnd___"
                  );
                  firstBitSent = true;
                } else {
                  res.write(
                    JSON.stringify({
                      _id: newMessageId,
                      content,
                    }) + "___msgEnd___"
                  );
                }
              }
            }
          }
        }
      });
    res.end();

    const newMessages = [
      { role: "user", content: req.body.content },
      { _id: newMessageId, role: "assistant", content: fullResponse },
    ];
    chat = await Chat.findOneAndUpdate(
      { _id: req.params._id },
      { $push: { messages: { $each: newMessages } } },
      { new: true }
    );
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const vote = async (req, res) => {
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

export const deleteChat = async (req, res) => {
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
