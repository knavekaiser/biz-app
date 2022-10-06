const {
  appConfig: { responseFn, responseStr },
} = require("../config");
const {
  dbHelper,
  appHelper: { normalizeDomain },
} = require("../helpers");
const { ObjectId } = require("mongodb");

const { User, Config, Collection } = require("../models");

exports.getSiteConfig = async (req, res) => {
  try {
    const domain = normalizeDomain(req.headers["origin"]);
    if (!domain) return responseFn.error(res, responseStr.record_not_found);
    const productCollection = await Collection.findOne({ name: "Product" });
    User.aggregate([
      { $match: { domain } },
      {
        $lookup: {
          from: "configs",
          localField: "_id",
          foreignField: "user",
          as: "config",
        },
      },
      { $unwind: { path: "$config" } },
      {
        $project: {
          siteTitle: "$name",
          slogan: "$motto",
          logo: "$logo",
          whatsappNumber: "$whatsappNumber",
          siteConfig: {
            productCard: "$config.siteConfig.productCard",
            currency: "$config.siteConfig.currency",
            landingPage: "$config.siteConfig.landingPage",
            browsePage: "$config.siteConfig.browsePage",
            productViewPage: "$config.siteConfig.productViewPage",
          },
        },
      },
    ])
      .then((data) =>
        responseFn.success(res, {
          data: {
            ...data[0],
            siteConfig: {
              currency: "USD",
              productFields: productCollection?.fields || null,
              ...data[0].siteConfig,
              currencies: [
                { currency: "USD", symbol: "$" },
                { currency: "INR", symbol: "₹" },
              ],
            },
          },
        })
      )
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.browse = async (req, res) => {
  try {
    const domain = normalizeDomain(
      req.headers["origin"] || req.headers["host"]
    );
    if (!domain) return responseFn.error(res, responseStr.record_not_found);

    const business = await User.findOne({ domain: "infinai.loca.lt" });
    if (!business) return responseFn.error(res, responseStr.record_not_found);

    const { Model, collection } = await dbHelper.getModel(
      business._id + "_" + "Product"
    );
    if (!Model) return responseFn.error(res, responseStr.record_not_found);

    const query = {};
    if (req.params._id) {
      if (mongoose.isValidObjectId(req.params._id)) {
        query._id = mongoose.Types.ObjectId(req.params._id);
      }
    }
    const sort = {};
    if (req.query.sort) {
      const [col, order] = req.query.sort.split("-");
      sort[col] = order === "asc" ? 1 : -1;
    } else {
      sort.price = -1;
    }
    const page = +req.query.page || 1;
    const pageSize = +req.query.pageSize || 10;

    collection.fields.forEach((field) => {
      if (req.query[field.name]) {
        if (field.dataType === "string") {
          query[field.name] = {
            $in: req.query[field.name]
              .split(",")
              .map((i) => new RegExp(i, "gi")),
          };
        } else if (field.dataType === "number") {
          query[field.name] = {
            $in: req.query[field.name]
              .split(",")
              .map((i) => +i)
              .filter((i) => i),
          };
        }
      } else if (
        field.dataType === "number" &&
        +req.query[field.name + "-min"] < +req.query[field.name + "-max"]
      ) {
        query[field.name] = {
          $gte: +req.query[field.name + "-min"],
          $lte: +req.query[field.name + "-max"],
        };
      }
    });

    Model.aggregate([
      ...dbHelper.getDynamicPipeline({
        fields: collection.fields,
        business_id: business._id,
        table: "Product",
      }),
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } },
      { $set: { seller: { name: "$user.name", logo: "$user.logo" } } },
      { $unset: ["__v", "user"] },
      { $sort: sort },
      // { $set: {
      //   images: {
      //     $map: {}
      //   }
      // } },
      {
        $facet: {
          data: [{ $skip: pageSize * (page - 1) }, { $limit: pageSize }],
          metadata: [{ $group: { _id: null, totalRecord: { $sum: 1 } } }],
        },
      },
    ])
      .then(([data]) => {
        if (req.params._id && mongoose.isValidObjectId(req.params._id)) {
          if (data.data.length > 0) {
            return responseFn.success(res, { data: data.data[0] });
          }
          return responseFn.error(res, responseStr.record_not_found);
        }
        responseFn.success(res, data);
      })
      .catch((err) =>
        responseFn.error(res, err.message || responseStr.error_occurred)
      );
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.getRelatedProducts = async (req, res) => {
  try {
    const domain = normalizeDomain(
      req.headers["origin"] || req.headers["host"]
    );
    if (!domain) return responseFn.error(res, responseStr.record_not_found);

    const business = await User.findOne({ domain: "infinai.loca.lt" });
    if (!business) return responseFn.error(res, responseStr.record_not_found);
    const config = await Config.findOne({ user: business._id });

    const { Model, collection } = await dbHelper.getModel(
      business._id + "_" + "Product"
    );
    if (!Model) return responseFn.error(res, responseStr.record_not_found);

    if (!mongoose.isValidObjectId(req.params._id)) {
      return responseFn.error(res, responseStr.record_not_found);
    }
    const product = await Model.findOne({ _id: ObjectId(req.params._id) });
    if (!product) {
      return responseFn.error(
        res,
        responseStr.record_not_found.replace("Product")
      );
    }

    const query = { _id: { $ne: product._id } };

    const recommendationFilters =
      config?.siteConfig?.productViewPage?.recommendationFilters;
    (recommendationFilters || []).forEach((filter) => {
      const field = collection.fields.find(
        (field) => field.name === filter.fieldName
      );
      if (filter.oparator === "lessThan") {
        query[filter.fieldName] = { $lt: product[filter.fieldName] };
      } else if (filter.oparator === "greaterThan") {
        query[filter.fieldName] = { $gt: product[filter.fieldName] };
      } else if (filter.oparator === "arrayIncludes") {
        query[filter.fieldName] = {
          $in: filter.includes[product[filter.fieldName]].map((item) =>
            field?.dataType === "objectId" ? ObjectId(item) : item
          ),
        };
      }
    });
    const limit =
      config?.siteConfig?.productViewPage?.recommendationLimit || 10;

    Model.aggregate([
      ...dbHelper.getDynamicPipeline({
        fields: collection.fields,
        business_id: business._id,
        table: "Product",
      }),
      { $match: query },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } },
      { $set: { seller: { name: "$user.name", logo: "$user.logo" } } },
      { $unset: ["__v", "user"] },
    ])
      .then((data) => {
        responseFn.success(res, { data });
      })
      .catch((err) =>
        responseFn.error(res, err.message || responseStr.error_occurred)
      );
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.getElements = async (req, res) => {
  try {
    const domain = normalizeDomain(
      req.headers["origin"] || req.headers["host"]
    );
    if (!domain) return responseFn.error(res, responseStr.record_not_found);

    const business = await User.findOne({ domain: "infinai.loca.lt" });
    if (!business) return responseFn.error(res, responseStr.record_not_found);

    const { Model, collection } = await dbHelper.getModel(
      business._id + "_" + req.params.table
    );
    if (!Model) return responseFn.error(res, responseStr.record_not_found);

    const queries = {};
    Model.find()
      .then((data) => {
        responseFn.success(res, { data });
      })
      .catch((err) =>
        responseFn.error(res, err.message || responseStr.error_occurred)
      );
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
