import { appConfig } from "../config/index.js";
import { fileHelper, aiHelper } from "../helpers/index.js";
import { FaqDoc, SubPlan } from "../models/index.js";

const { responseFn, responseStr } = appConfig;

export const findAll = async (req, res) => {
  try {
    let { page, pageSize } = req.query;
    page = +page;
    pageSize = +pageSize;

    const condition = { user: req.business?._id || req.authUser._id };
    if (req.query.topic) {
      condition.topic = { $regex: req.query.topic, $options: "i" };
    }
    const pipeline = [{ $match: condition }];
    if (page && pageSize) {
      pipeline.push({
        $facet: {
          records: [{ $skip: pageSize * (page - 1) }, { $limit: pageSize }],
          metadata: [{ $group: { _id: null, total: { $sum: 1 } } }],
        },
      });
    }

    FaqDoc.aggregate(pipeline)
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

export const create = async (req, res) => {
  try {
    const subPlan = await SubPlan.findOne({
      _id: (req.business || req.authUser).subscription?.plan,
    });
    const context = await aiHelper.getContext({
      files: req.body.files || [],
      urls: req.body.urls || [],
      content: req.body.content,
    });
    const tokenCount = aiHelper.countToken(context);
    if (tokenCount > subPlan?.features.maxAiChatContextToken) {
      return responseFn.error(
        res,
        {},
        responseStr.max_context_token_limit
          .replace("{TOKEN_COUNT}", tokenCount)
          .replace("{MAX_TOKEN}", subPlan?.features.maxAiChatContextToken)
      );
    }

    req.body.tokenCount = tokenCount;
    let newDoc = null;
    new FaqDoc({
      ...req.body,
      user: req.business?._id || req.authUser._id,
    })
      .save()
      .then(async (data) => {
        newDoc = data;
        return aiHelper.pushToPinecone({
          files: req.body.files || [],
          urls: req.body.urls || [],
          metadata: {
            topicId: data._id,
            userId: data.user,
          },
        });
      })
      .then(() => responseFn.success(res, { data: newDoc }))
      .catch((err) => {
        responseFn.error(res, {}, err.message);
        // remove uploaded files
      });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const generateUserContext = async (req, res) => {
  try {
    const faqDoc = await FaqDoc.findOne({ _id: req.params._id });

    const context = await aiHelper.getContext({
      files: faqDoc.files,
      urls: faqDoc.urls,
      content: faqDoc.content,
    });

    const messages = [
      {
        role: "system",
        content: `${req.body.prompt}

${context}`,
      },
    ];
    const contextForUsers = await aiHelper
      .generateResponse(messages, 100)
      .then((data) => data?.message?.content);

    req.body.contextForUsers = contextForUsers;

    if (!contextForUsers) {
      return responseFn.error(res, {});
    }

    responseFn.success(res, { data: { contextForUsers } });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

const compareArr = (arr1, arr2) =>
  arr1.length === arr2.length &&
  arr1.every((item, index) => item === arr2[index]);

const compareArrWithObj = (arr1, arr2) =>
  arr1.length === arr2.length &&
  arr1.every((obj1) =>
    arr2.some(
      (obj2) =>
        obj2.url === obj1.url &&
        Object.keys(obj2).every((key) => obj2[key] === obj1[key])
    )
  );

export const update = async (req, res) => {
  try {
    const doc = await FaqDoc.findOne({ _id: req.params._id });
    const subPlan = await SubPlan.findOne({
      _id: (req.business || req.authUser).subscription?.plan,
    });

    let filesToRemove = [];
    if (req.body.files) {
      filesToRemove.push(
        ...doc.files.filter(
          (item) => !req.body.files.some((i) => i.url === item.url)
        )
      );
    }

    const context = await aiHelper.getContext({
      files: req.body.files || [],
      urls: req.body.urls || [],
      content: req.body.content,
    });
    const tokenCount = aiHelper.countToken(context);
    if (tokenCount > subPlan?.features.maxAiChatContextToken) {
      return responseFn.error(
        res,
        {},
        responseStr.max_context_token_limit
          .replace("{TOKEN_COUNT}", tokenCount)
          .replace("{MAX_TOKEN}", subPlan?.features.maxAiChatContextToken)
      );
    }

    req.body.tokenCount = tokenCount;
    FaqDoc.findOneAndUpdate(
      { _id: req.params._id, user: req.business?._id || req.authUser._id },
      req.body,
      { new: true }
    )
      .then(async (data) => {
        if (
          !data.vectorIds?.length ||
          !compareArr(doc.urls, data.urls) ||
          !compareArrWithObj(doc.files, data.files)
        ) {
          await aiHelper.pushToPinecone({
            files: req.body.files || [],
            urls: req.body.urls || [],
            oldVectorIds: data.vectorIds,
            metadata: {
              topicId: doc._id,
              userId: doc.user,
            },
          });
        }
        responseFn.success(res, { data }, responseStr.record_updated);
        if (filesToRemove.length) {
          fileHelper.deleteFiles(filesToRemove.map((item) => item.url));
        }
      })
      .catch((err) => {
        if (req.files?.length) {
          // fileHelper.deleteFiles(req.files.map((item) => item.url));
        }
        responseFn.error(res, {}, err.message);
      });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const deleteDoc = async (req, res) => {
  try {
    if (!req.params._id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }

    const doc = await FaqDoc.find({
      _id: { $in: [...(req.body.ids || []), req.params._id] },
      user: req.business?._id || req.authUser._id,
    });

    FaqDoc.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params._id] },
      user: req.business?._id || req.authUser._id,
    })
      .then((num) => {
        responseFn.success(res, {}, responseStr.record_deleted);
        fileHelper.deleteFiles(
          doc
            .map((item) => item.files)
            .flat()
            .map((item) => item.url)
        );
        aiHelper.removeVectors(doc.map((item) => item.vectorIds).flat());
      })
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
