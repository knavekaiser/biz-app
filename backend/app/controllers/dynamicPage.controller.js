import { appConfig } from "../config/index.js";
import { fileHelper } from "../helpers/index.js";
import { getModel } from "../models/index.js";

const { responseFn, responseStr } = appConfig;

export const findAll = async (req, res) => {
  try {
    const DynamicPage = getModel({
      companyId: req.business._id,
      name: "DynamicPage",
    });

    let { page, pageSize } = req.query;
    page = +page;
    pageSize = +pageSize;

    const condition = {};
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

    DynamicPage.aggregate(pipeline)
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
    const DynamicPage = getModel({
      companyId: req.business._id,
      name: "DynamicPage",
    });

    new DynamicPage(req.body)
      .save()
      .then(async (data) => responseFn.success(res, { data }))
      .catch((err) => {
        responseFn.error(res, {}, err.message);
        // remove uploaded files
      });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const update = async (req, res) => {
  try {
    const DynamicPage = getModel({
      companyId: req.business._id,
      name: "DynamicPage",
    });

    const doc = await DynamicPage.findOne({ _id: req.params._id });

    let filesToRemove = [];
    if (req.body.files) {
      filesToRemove.push(...doc.files);
    }
    if (req.body.thumbnail) {
      filesToRemove.push(req.body.thumbnail);
    }

    DynamicPage.findOneAndUpdate({ _id: req.params._id }, req.body, {
      new: true,
    })
      .then((data) => {
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

export const deletePage = async (req, res) => {
  try {
    const DynamicPage = getModel({
      companyId: req.business._id,
      name: "DynamicPage",
    });

    if (!req.params._id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }

    const files = await DynamicPage.find({
      _id: { $in: [...(req.body.ids || []), req.params._id] },
    }).then((data) => data.map((item) => item.files).flat());

    DynamicPage.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params._id] },
    })
      .then((num) => {
        responseFn.success(res, {}, responseStr.record_deleted);
        fileHelper.deleteFiles(files.map((item) => item.url));
      })
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
