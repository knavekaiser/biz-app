const {
  appConfig: { responseFn, responseStr },
} = require("../config");
const { fileHelper, dbHelper } = require("../helpers");

const { Store, StoreConfig, AdSchema } = require("../models");

exports.homeStores = async (req, res) => {
  try {
    const { category, subCategory, ...query } = req.query;
    const conditions = {
      $expr: {
        $and: [
          { $lte: ["$start", new Date()] },
          { $gte: ["$end", new Date()] },
        ],
      },
    };
    if (category) {
      conditions.category = { $in: category.split(",") };
    }
    if (subCategory) {
      conditions.subCategory = { $in: subCategory.split(",") };
    }
    const productQuery = [];
    const schema = await AdSchema.findOne({ category, name: subCategory });
    schema?.fields.forEach((field) => {
      if (field.name in query) {
        if (field.dataType === "string" || field.dataElementType === "string") {
          productQuery.push({
            $regexMatch: {
              input:
                field.dataElementType === "string"
                  ? {
                      $reduce: {
                        input: `$$product.${field.name}`,
                        initialValue: "",
                        in: { $concat: ["$$value", "$$this"] },
                      },
                    }
                  : `$$product.${field.name}`,
              regex: RegExp(query[field.name].split(",").join("|")),
              options: "i",
            },
          });
        } else if (field.dataElementType === "number") {
          query.push({
            $in: [
              query[field.name]
                .split(",")
                .map((i) => +i)
                .map((i) => isNaN(i)),
              `$$product.${field.name}`,
            ],
          });
        } else if (field.dataType === "number") {
          productQuery.push({
            $eq: [`$$product.${field.name}`, +query[field.name]],
          });
        }
      } else if (
        +req.query[field.name + "-min"] <= +req.query[field.name + "-max"]
      ) {
        productQuery.push({
          $and: [
            { $gte: [`$$product.${field.name}`, +query[`${field.name}-min`]] },
            { $lte: [`$$product.${field.name}`, +query[`${field.name}-max`]] },
          ],
        });
      }
    });
    // console.log(query, JSON.stringify(productQuery, null, 2));
    Store.aggregate([
      { $match: conditions },
      {
        $lookup: {
          from: "users",
          as: "business",
          let: { id: "$business" },
          pipeline: [
            { $match: { $expr: { $eq: ["$$id", "$_id"] } } },
            {
              $project: {
                phone: 1,
                email: 1,
                name: 1,
                photo: 1,
                logo: 1,
                domain: 1,
                address: 1,
              },
            },
            {
              $lookup: {
                from: "configs",
                localField: "_id",
                foreignField: "user",
                as: "siteConfig",
              },
            },
            {
              $unwind: {
                path: "$siteConfig",
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $set: {
                siteConfig: "$siteConfig.siteConfig",
              },
            },
          ],
        },
      },
      { $unwind: { path: "$business", preserveNullAndEmptyArrays: false } },
      ...(productQuery.length
        ? [
            {
              $addFields: {
                products: {
                  $filter: {
                    input: "$products",
                    as: "product",
                    cond: {
                      $and: productQuery,
                    },
                  },
                },
              },
            },
          ]
        : []),
      { $match: { $expr: { $gt: [{ $size: "$products" }, 0] } } },
    ])
      .then(async (data) => {
        responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.homeCategories = async (req, res) => {
  try {
    const { Model } = await dbHelper.getAdminModel("Category");
    Model.aggregate([
      {
        $lookup: {
          from: "adschemas",
          localField: "name",
          foreignField: "category",
          as: "subCategories",
        },
      },
      {
        $project: {
          name: 1,
          "subCategories.name": 1,
          "subCategories.fields": 1,
        },
      },
    ])
      .then(async (data) => {
        responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.homeConfig = async (req, res) => {
  try {
    StoreConfig.findOne()
      .then(async (data) => {
        responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.find = async (req, res) => {
  try {
    const conditions = {};
    if ("name" in req.query) {
      conditions.name = {
        $regex: req.query.name,
        $options: "i",
      };
    }
    if ("business" in req.query) {
      conditions.business = req.query.business;
    }
    Store.find(conditions, "-__v")
      .populate("business", "name phone email domain logo")
      .populate("createdBy", "name phone email")
      .then((data) => {
        responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    new Store({ ...req.body, createdBy: req.authUser._id })
      .save()
      .then(async (data) => {
        const store = await Store.findOne({ _id: data._id })
          .populate("business", "name phone email domain logo")
          .populate("createdBy", "name phone email");
        return responseFn.success(res, { data: store });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    if (req.body.image) {
      fileHelper.deleteFiles(req.body.image);
    }
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    Store.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
      .then(async (data) => {
        const store = await Store.findOne({ _id: data._id })
          .populate("business", "name phone email domain logo")
          .populate("createdBy", "name phone email");
        return responseFn.success(
          res,
          { data: store },
          responseStr.record_updated
        );
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
    const stores = await Store.find(
      {
        _id: { $in: [...(req.body.ids || []), req.params.id] },
      },
      "photo"
    );
    stores.forEach(async (store) => {
      if (store.photo) {
        fileHelper.deleteFiles(store.photo);
      }
    });
    Store.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.storeConfig = async (req, res) => {
  try {
    StoreConfig.findOne().then((data) => responseFn.success(res, { data }));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.updateStoreConfig = async (req, res) => {
  try {
    StoreConfig.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
    }).then((data) => responseFn.success(res, { data }));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
