const {
  appConfig: { responseFn, responseStr },
} = require("../config");

const { User, AdminCollection } = require("../models");
const { ObjectId } = require("mongodb");

exports.findAll = async (req, res) => {
  try {
    const _id =
      req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)
        ? ObjectId(req.params.id)
        : null;
    let tableName =
      req.params.id && !req.params.id.match(/^[0-9a-fA-F]{24}$/)
        ? req.params.id
        : null;
    const conditions = {};
    if (req.authToken.userType === "admin") {
      conditions.user = req.query.business;
    }
    if (_id) {
      conditions._id = _id;
    }
    if (req.authToken.userType === "staff") {
      const dynamicTables = req.permissions
        .filter(
          (item) =>
            item.startsWith(req.business._id.toString()) &&
            item.endsWith("_read")
        )
        .map((item) =>
          item.replace("_read", "").replace(`${req.business._id}_`, "")
        );
      if (tableName && dynamicTables.includes(tableName)) {
        conditions.name = tableName;
      } else {
        tableName = null;
        conditions.name = { $in: dynamicTables };
      }
    } else {
      if (tableName) {
        conditions.name = tableName;
      }
    }
    AdminCollection.find(conditions)
      .then((data) => {
        if (_id || tableName) {
          if (data.length) {
            responseFn.success(res, { data: data[0] });
          } else {
            responseFn.error(res, {}, responseStr.record_not_found);
          }
          return;
        }
        responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    new AdminCollection({ ...req.body })
      .save()
      .then(async (data) => {
        return responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    delete req.body.name;
    AdminCollection.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
    })
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
    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    const collections = await AdminCollection.find({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
    });
    AdminCollection.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
    })
      .then(async (num) => {
        for (const collection of collections) {
          mongoose.connection.db.dropCollection(
            `Admin_${collection.name}`,
            function (err, result) {}
          );
        }
        responseFn.success(res, {}, responseStr.record_deleted);
      })
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.getSchemaTemplates = async (req, res) => {
  try {
    User.aggregate([
      {
        $lookup: {
          from: "schemas",
          localField: "_id",
          foreignField: "user",
          as: "schemas",
        },
      },
      {
        $match: {
          $expr: { $gt: [{ $size: "$schemas" }, 0] },
          _id: { $ne: req.business?._id || req.authUser._id },
        },
      },
      { $project: { name: 1, _id: 1 } },
    ])
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.addSchemaTemplates = async (req, res) => {
  try {
    const schemas = await AdminCollection.find({
      user: ObjectId(req.body.schema_id),
    }).then((data) =>
      data.map((item) => ({
        name: item.name,
        fields: item.fields,
        user: req.business?._id || req.authUser._id,
      }))
    );

    await AdminCollection.deleteMany({
      name: { $in: schemas.map((item) => item.name) },
      user: req.business?._id || req.authUser._id,
    });

    AdminCollection.insertMany(schemas, { ordered: 1 })
      .then((data) => {
        responseFn.success(
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
