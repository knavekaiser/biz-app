const {
  appConfig: { responseFn, responseStr },
} = require("../config");
const {
  dbHelper,
  appHelper: { normalizeDomain },
} = require("../helpers");

const { User, Config } = require("../models");

exports.getData = async (req, res) => {
  try {
    const domain = normalizeDomain(req.headers["origin"]);
    if (!domain) return responseFn.error(res, responseStr.record_not_found);
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
          siteConfig: {
            productCard: "$config.siteConfig.productCard",
            currency: "$config.siteConfig.currency",
            landingPage: "$config.siteConfig.landingPage",
            browsePage: "$config.siteConfig.browsePage",
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

    const ProductModel = await dbHelper.getModel(
      business._id + "_" + "Product"
    );
    if (!ProductModel)
      return responseFn.error(res, responseStr.record_not_found);

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
    ProductModel.aggregate([
      { $match: query },
      { $sort: sort },
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
