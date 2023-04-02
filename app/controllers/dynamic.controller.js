const {
  appConfig: { responseFn, responseStr },
} = require("../config");
const { dbHelper } = require("../helpers");
const { ObjectId } = require("mongodb");

exports.findAll = async (req, res) => {
  try {
    const { Model, collection } = req;
    const conditions = {};
    if (req.params.id) {
      conditions._id = req.params.id;
    }

    const { page, pageSize, ...query } = req.query;
    Object.entries(query).forEach(([key, value]) => {
      if (key === "_id") {
        conditions._id = {
          $in: value
            .split(",")
            .map((item) =>
              mongoose.isValidObjectId(item) ? ObjectId(item) : item
            ),
        };
        return;
      }

      const field = collection.fields.find((item) => item.name === key);
      if (!field) return;

      if (field.dataType === "string" || field.dataElementType === "string") {
        conditions[field.name] = {
          $in: value.split(",").map((i) => new RegExp(i, "gi")),
        };
      } else if (
        field.dataType === "number" ||
        field.dataElementType === "number"
      ) {
        conditions[field.name] = {
          $in: value
            .split(",")
            .map((i) => +i)
            .filter((i) => i),
        };
      }
    });

    let pipeline = [{ $match: conditions }];
    collection.fields
      .filter(
        (item) =>
          (item.dataType === "objectId" ||
            item.dataElementType === "objectId") &&
          item.optionType === "collection"
      )
      .forEach((field) => {
        pipeline.push({
          $lookup: {
            from: `${req.authUser._id}_${field.collection}`,
            let: { fieldName: `$${field.name}` },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [`$${field.optionValue}`, `$$fieldName`],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                },
              },
            ],
            as: field.name,
          },
        });
        if (!field.multiple) {
          pipeline.push({
            $set: {
              [field.name]: { $first: `$${field.name}` },
            },
          });
        }
      });
    if (page && pageSize) {
      pipeline.push(
        ...[
          { $sort: { createdAt: -1 } },
          {
            $facet: {
              data: [{ $skip: +pageSize * (+page - 1) }, { $limit: +pageSize }],
              metadata: [{ $group: { _id: null, total: { $sum: 1 } } }],
            },
          },
        ]
      );
    }
    // pipeline = dbHelper.getDynamicPipeline({
    //   fields: collection.fields,
    //   pipeline,
    //   business_id: req.business?._id || req.authUser._id,
    //   table: req.params.table,
    // });

    Model.aggregate(pipeline)
      .then((data) => {
        responseFn.success(
          res,
          page && pageSize
            ? {
                metadata: {
                  total: data[0].metadata[0]?.total || 0,
                  page: +page,
                  pageSize: +pageSize,
                },
                data: data[0].data,
              }
            : { data }
        );
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    console.log(error);
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const { Model, collection } = req;

    if (collection.fields.some((item) => item.dataType === "object")) {
      collection.fields
        .filter((item) => item.dataType === "object")
        .forEach((field) => {
          if (req.body[field.name]) {
            try {
              req.body[field.name] = JSON.parse(req.body[field.name]);
            } catch (err) {
              req.body[field.name] = {};
            }
          }
        });
    }

    new Model({ ...req.body })
      .save()
      .then(async (data) => {
        const newItem = await Model.aggregate(
          dbHelper.getDynamicPipeline({
            fields: collection.fields,
            pipeline: [{ $match: { _id: data._id } }],
            business_id: req.business?._id || req.authUser._id,
            table: req.params.table,
          })
        );
        return responseFn.success(res, { data: newItem[0] });
      })
      .catch((err) => {
        if (err.code === 11000) {
          return responseFn.error(
            res,
            {},
            err.message.replace(/.*?({.*)/, "$1") + " already exists."
          );
        }
        responseFn.error(res, {}, err.message);
      });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.bulkCreate = async (req, res) => {
  try {
    const { Model, collection } = req;
    const data = req.body.data || req.body;

    if (collection.fields.some((item) => item.dataType === "object")) {
      const fields = collection.fields.filter(
        (item) => item.dataType === "object"
      );
      data.forEach((item, i) => {
        fields.forEach((field) => {
          if (data[i][field.name]) {
            try {
              data[i][field.name] = JSON.parse(data[i][field.name]);
            } catch (err) {
              data[i][field.name] = {};
            }
          }
        });
      });
    }

    Model.insertMany(data, { ordered: false })
      .then(async (data) => {
        return responseFn.success(
          res,
          {},
          responseStr.records_created.replace("{num}", data.length)
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
        responseFn.error(res, {}, err.message);
      });
  } catch (error) {
    console.log(error);
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const { Model, collection } = req;

    if (collection.fields.some((item) => item.dataType === "object")) {
      collection.fields
        .filter((item) => item.dataType === "object")
        .forEach((field) => {
          if (req.body[field.name]) {
            try {
              req.body[field.name] = JSON.parse(req.body[field.name]);
            } catch (err) {
              req.body[field.name] = {};
            }
          }
        });
    }
    if (collection.name === "Product" && "variants" in req.body) {
      req.body.variants = JSON.parse(req.body.variants);
    }

    Model.findOneAndUpdate(
      { _id: req.params.id },
      { ...req.body },
      { new: true }
    )
      .then((data) => {
        return responseFn.success(res, { data }, responseStr.record_updated);
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.delete = async (req, res) => {
  try {
    const { Model } = req;
    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }

    Model.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.findCommonCollection = async (req, res) => {
  try {
    const { Model, collection } = req;

    const conditions = {};

    Model.find(conditions)
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
