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

      if (field.dataType === "string") {
        conditions[field.name] = {
          $in: value.split(",").map((i) => new RegExp(i, "gi")),
        };
      } else if (field.dataType === "number") {
        conditions[field.name] = {
          $in: value
            .split(",")
            .map((i) => +i)
            .filter((i) => i),
        };
      }
    });

    let pipeline = [{ $match: conditions }];
    // pipeline = dbHelper.getDynamicPipeline({
    //   fields: collection.fields,
    //   pipeline,
    //   business_id: req.business?._id || req.authUser._id,
    //   table: req.params.table,
    // });

    Model.aggregate(pipeline)
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const { Model, collection } = req;
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
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.bulkCreate = async (req, res) => {
  try {
    const { Model, collection } = req;
    Model.insertMany(req.body.data, { ordered: false })
      .then(async (data) => {
        return responseFn.success(
          res,
          {},
          responseStr.records_created.replace("{num}", data.length)
        );
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const { Model, collection } = req;
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
