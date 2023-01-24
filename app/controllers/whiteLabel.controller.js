const {
  appConfig: { responseFn, responseStr },
} = require("../config");
const {
  dbHelper,
  appHelper: { normalizeDomain, ...appHelper },
} = require("../helpers");
const { ObjectId } = require("mongodb");

const { User, Config, Collection } = require("../models");

exports.getSiteConfig = async (req, res) => {
  try {
    let domain = normalizeDomain(req.headers["origin"]);
    if (!domain) return responseFn.error(res, {}, responseStr.record_not_found);
    if (domain === "localhost:3000") domain = "infinai.loca.lt";

    const productCollection = await Collection.findOne({
      name: "Product",
      user: req.business._id,
    });
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
          siteDescription: "$description",
          favicon: "$favicon",
          slogan: "$motto",
          logo: "$logo",
          whatsappNumber: "$whatsappNumber",
          siteConfig: {
            productCard: "$config.siteConfig.productCard",
            currency: "$config.siteConfig.currency",
            landingPage: "$config.siteConfig.landingPage",
            browsePage: "$config.siteConfig.browsePage",
            productViewPage: "$config.siteConfig.productViewPage",
            footer: "$config.siteConfig.footer",
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

exports.sitemapUrls = async (req, res) => {
  try {
    let domain = normalizeDomain(req.headers["origin"]);
    if (!domain) return responseFn.error(res, {}, responseStr.record_not_found);
    if (domain === "localhost:3000") domain = "infinai.loca.lt";

    const { Model: Product } = await dbHelper.getModel(
      req.business._id + "_" + "Product"
    );

    const product_ids = await Product.find().select("_id");
    const defaultUrls = [
      `${req.protocol}://${domain}`,
      `${req.protocol}://${domain}/browse`,
    ];
    const dynamicUrls = [];

    return responseFn.success(res, {
      data: [
        ...defaultUrls,
        ...product_ids.map(
          ({ _id }) => `${req.protocol}://${domain}/item/${_id}`
        ),
        ...dynamicUrls,
      ],
    });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.getDynamicPageFiles = async (req, res) => {
  try {
    let domain = normalizeDomain(req.headers["origin"]);
    if (!domain) return responseFn.error(res, {}, responseStr.record_not_found);
    if (domain === "localhost:3000") domain = "infinai.loca.lt";

    const config = await Config.findOne({ user: req.business._id });

    let files = null;
    config.siteConfig.footer.sections.some((section) => {
      const item = section.items.find(
        (item) =>
          item.href.replace("/", "") === req.params.pageId && item.files?.length
      );
      if (item) {
        files = item.files;
        return true;
      }
    });
    if (files?.length) {
      return responseFn.success(res, { data: files });
    }
    return responseFn.error(
      res,
      {},
      responseStr.record_not_found.replace("Record", "Page"),
      400
    );
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.browse = async (req, res) => {
  try {
    const { Model, collection } = await dbHelper.getModel(
      req.business._id + "_" + "Product"
    );
    if (!Model) return responseFn.error(res, {}, responseStr.record_not_found);

    const query = {};
    if (req.params._id) {
      if (mongoose.isValidObjectId(req.params._id)) {
        query._id = ObjectId(req.params._id);
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
        +req.query[field.name + "-min"] <= +req.query[field.name + "-max"]
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
        business_id: req.business._id,
        table: "Product",
      }),
      { $match: query },
      {
        $set: { seller: { name: req.business.name, logo: req.business.logo } },
      },
      ...dbHelper.getRatingBreakdownPipeline({ business: req.business }),
      { $unset: ["__v"] },
      { $sort: sort },
      // { $set: { images: { $map: {} } } },
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
          return responseFn.error(res, {}, responseStr.record_not_found);
        }
        responseFn.success(res, data);
      })
      .catch((err) => {
        responseFn.error(res, {}, err.message || responseStr.error_occurred);
      });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.getRelatedProducts = async (req, res) => {
  try {
    const config = await Config.findOne({ user: req.business._id });

    const { Model, collection } = await dbHelper.getModel(
      req.business._id + "_" + "Product"
    );
    if (!Model) return responseFn.error(res, {}, responseStr.record_not_found);

    if (!mongoose.isValidObjectId(req.params._id)) {
      return responseFn.error(res, {}, responseStr.record_not_found);
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
      } else if (filter.oparator === "match") {
        query[filter.fieldName] = product[filter.fieldName];
      } else if (filter.oparator === "customMapping") {
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
        business_id: req.business._id,
        table: "Product",
      }),
      { $match: query },
      { $limit: limit },
      ...dbHelper.getRatingBreakdownPipeline({ business: req.business }),
      {
        $lookup: {
          from: "users",
          as: "user",
          // localField: "user",
          // foreignField: "_id",
          pipeline: [{ $match: { _id: req.business._id } }],
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
        responseFn.error(res, {}, err.message || responseStr.error_occurred)
      );
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.getElements = async (req, res) => {
  try {
    const { Model, collection } = await dbHelper.getModel(
      req.business._id + "_" + req.params.table
    );
    if (!Model) return responseFn.error(res, {}, responseStr.record_not_found);

    const queries = {};
    Model.find()
      .then((data) => {
        responseFn.success(res, { data });
      })
      .catch((err) =>
        responseFn.error(res, {}, err.message || responseStr.error_occurred)
      );
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.getLandingPageShelves = async (req, res) => {
  try {
    const { Model, collection } = await dbHelper.getModel(
      req.business._id + "_Product"
    );
    if (!Model) return responseFn.error(res, {}, responseStr.record_not_found);

    const shelves = await Config.findOne({ user: req.business._id }).then(
      (config) => config?.siteConfig?.landingPage?.shelves
    );
    if (!shelves || shelves.length === 0)
      return responseFn.error(
        res,
        {},
        responseStr.record_not_found.replace("record", "Shelves")
      );

    const facet = {};
    shelves.forEach((shelf) => {
      const query = {};
      shelf.productFilters.forEach((filter) => {
        const field = collection.fields.find(
          (field) => field.name === filter.fieldName
        );
        if (!field) return;
        if (filter.filterType === "minMax") {
          query[filter.fieldName] = { $gte: +filter.min, $lte: +filter.max };
        } else if (
          filter.filterType === "match" &&
          filter.dataType === "number"
        ) {
          query[filter.fieldName] = +filter.value;
        } else if (filter.filterType === "textSearch") {
          query[filter.fieldName] = new RegExp(filter.value, "i");
        } else if (
          ["select", "combobox"].includes(field.fieldType) &&
          filter.value?.length
        ) {
          query[filter.fieldName] = {
            $in: filter.value.map((item) =>
              field.dataType === "objectId" ? ObjectId(item) : item
            ),
          };
        }
      });
      facet[shelf.title] = [
        ...dbHelper.getDynamicPipeline({
          fields: collection.fields,
          business_id: req.business._id,
          table: "Product",
        }),
        { $match: query },
        { $limit: shelf.productCount },
        ...dbHelper.getRatingPipeline({ business: req.business }),
      ];
    });
    Model.aggregate([{ $facet: facet }])
      .then((data) => {
        responseFn.success(res, {
          data: Object.entries(data[0] || {})
            .map(([key, value]) => {
              const query = {};
              const shelf = shelves.find((item) => item.title === key) || [];
              shelf?.productFilters.forEach((filter) => {
                if (filter.filterType === "minMax") {
                  query[`${filter.fieldName}-min`] = filter.min;
                  query[`${filter.fieldName}-max`] = filter.max;
                  return;
                }
                query[filter.fieldName] = filter.value;
              });
              return {
                title: key,
                products: value,
                horizontalSlide: shelf.horizontalSlide || false,
                query,
              };
            })
            .filter((item) => item.products.length),
        });
      })
      .catch((err) => {
        console.log(err);
        responseFn.error(res, {}, err.message);
      });
  } catch (error) {
    console.log(error);
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.validateAccount = async (req, res) => {
  try {
    if (!(req.body.phone || req.body.email)) {
      return responseFn.error(
        res,
        {},
        responseStr.field_required.replace("{field}", "Phone or Email")
      );
    }
    const { Model, collection } = await dbHelper.getModel(
      req.business._id + "_Customer"
    );
    if (!Model) return responseFn.error(res, {}, responseStr.record_not_found);

    Model.findOne(req.body).then((customer) => {
      if (customer) {
        responseFn.success(res, { data: { newUser: false } });
      } else {
        responseFn.success(res, { data: { newUser: true } });
      }
    });
  } catch (error) {
    console.log(error);
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.signup = async (req, res) => {
  if (!(req.body.phone || req.body.email)) {
    return responseFn.error(
      res,
      {},
      responseStr.field_required.replace("{field}", "Phone or Email")
    );
  }

  const { Model, collection } = await dbHelper.getModel(
    req.business._id + "_Customer"
  );
  if (!Model) return responseFn.error(res, {}, responseStr.record_not_found);

  const customer = await Model.findOne({
    ...(req.body.phone && { phone: req.body.phone }),
    ...(req.body.email && { email: req.body.email }),
  });
  if (customer) {
    return responseFn.error(
      res,
      {},
      `${req.body.phone ? "Phone" : "Email"} Already registered`
    );
  }

  req.body.password = appHelper.generateHash(req.body.password);
  new Model(req.body)
    .save()
    .then((customer) => {
      return appHelper.signIn(res, customer._doc, "customer");
    })
    .catch((err) => responseFn.error(res, {}, err.message));
};

exports.login = async (req, res) => {
  try {
    if (!(req.body.phone || req.body.email)) {
      return responseFn.error(
        res,
        {},
        responseStr.field_required.replace("{field}", "Phone or Email")
      );
    }
    const { Model, collection } = await dbHelper.getModel(
      req.business._id + "_Customer"
    );
    if (!Model) return responseFn.error(res, {}, responseStr.record_not_found);

    const user = await Model.findOne({
      ...(req.body.phone && { phone: req.body.phone }),
      ...(req.body.email && { email: req.body.email }),
    });

    if (user && appHelper.compareHash(req.body.password, user.password)) {
      return appHelper.signIn(res, user._doc, "customer");
    } else {
      return responseFn.error(res, {}, responseStr.invalid_cred);
    }
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("access_token");
    return responseFn.success(res, {});
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.profile = async (req, res) => {
  try {
    const { Model, collection } = await dbHelper.getModel(
      req.business._id + "_Customer"
    );
    if (!Model) return responseFn.error(res, {}, responseStr.record_not_found);
    Model.findOne({ _id: req.authUser.id }, "-password -__v -updatedAt")
      .then(async (data) => responseFn.success(res, { data }))
      .catch((error) => responseFn.error(res, {}, error.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.addReview = async (req, res) => {
  try {
    const { Model: Product } = await dbHelper.getModel(
      req.business._id + "_Product"
    );
    const product = await Product.findOne({ _id: req.body.product });
    if (!product) {
      return responseFn.error(res, {}, responseStr.record_not_found);
    }

    const { Model, collection } = await dbHelper.getModel(
      req.business._id + "_Review"
    );
    if (!Model) return responseFn.error(res, {}, responseStr.record_not_found);

    new Model({
      ...req.body,
      rating: Math.round(req.body.rating),
      customer: req.authUser._id,
    })
      .save()
      .then((review) => {
        responseFn.success(res, { data: review });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { Model, collection } = await dbHelper.getModel(
      req.business._id + "_Review"
    );
    if (!Model) return responseFn.error(res, {}, responseStr.record_not_found);

    Model.aggregate([
      { $match: { product: ObjectId(req.params._id) } },
      {
        $lookup: {
          from: `${req.business._id}_Customer`,
          localField: "customer",
          foreignField: "_id",
          as: "_customer",
        },
      },
      {
        $unwind: {
          path: "$_customer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          "customer.name": "$_customer.name",
          "customer.image": "$_customer.image",
        },
      },
      {
        $unset: "_customer",
      },
    ])
      .then((reviews) => {
        responseFn.success(res, { data: reviews });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

const query = [
  {
    $lookup: {
      from: "63c9154fa7041e92b06202ef_Campaign",
      let: { product: "$$ROOT" },
      pipeline: [
        {
          $match: {
            startDate: { $lt: "2023-01-23T04:18:46.258Z" },
            endDate: { $gt: "2023-01-23T04:18:46.258Z" },
            status: "active",
          },
        },
        {
          $unwind: { path: "$amountTable", preserveNullAndEmptyArrays: false },
        },
        {
          $match: {
            "amountTable.startDate": { $lt: "2023-01-23T04:18:46.258Z" },
            "amountTable.endDate": { $gt: "2023-01-23T04:18:46.258Z" },
          },
        },
        {
          $set: {
            includeProductExpr: {
              $map: {
                input: { $objectToArray: "$includeProducts" },
                as: "filter",
                in: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: ["$$filter.v.filterType", "minMax"] },
                        then: {
                          $reduce: {
                            input: {
                              $filter: {
                                input: { $objectToArray: "$$product" },
                                cond: { $eq: ["$$this.k", "$$filter.k"] },
                              },
                            },
                            initialValue: null,
                            in: {
                              $cond: {
                                if: { $eq: ["$$this.k", "$$filter.k"] },
                                then: {
                                  $cond: [
                                    {
                                      $and: [
                                        {
                                          $gte: ["$$this.v", "$$filter.v.min"],
                                        },
                                        {
                                          $lte: ["$$this.v", "$$filter.v.max"],
                                        },
                                      ],
                                    },
                                    true,
                                    false,
                                  ],
                                },
                                else: false,
                              },
                            },
                          },
                        },
                      },
                      {
                        case: {
                          $eq: ["$$filter.v.filterType", "stringContains"],
                        },
                        then: {
                          $reduce: {
                            input: {
                              $filter: {
                                input: { $objectToArray: "$$product" },
                                cond: { $eq: ["$$this.k", "$$filter.k"] },
                              },
                            },
                            initialValue: null,
                            in: {
                              $cond: {
                                if: { $eq: ["$$this.k", "$$filter.k"] },
                                then: {
                                  $regexMatch: {
                                    input: "$$this.v",
                                    regex: "$$filter.v.text",
                                  },
                                },
                                else: false,
                              },
                            },
                          },
                        },
                      },
                    ],
                    default: false,
                  },
                },
              },
            },
          },
        },
        {
          $match: {
            includeProductExpr: { $not: { $elemMatch: { $eq: false } } },
          },
        },
      ],
      as: "campaign",
    },
  },
  { $set: { campaign: { $first: "$campaign" } } },
  {
    $set: {
      currentPrice: {
        $switch: {
          branches: [
            {
              case: { $eq: ["$campaign.amountTable.amountType", "flat"] },
              then: { $add: ["$price", "$campaign.amountTable.amount"] },
            },
            {
              case: { $eq: ["$campaign.amountTable.amountType", "percent"] },
              then: {
                $add: [
                  "$price",
                  {
                    $multiply: [
                      "$campaign.amountTable.amount",
                      { $divide: ["$price", 100] },
                    ],
                  },
                ],
              },
            },
          ],
          default: "$price",
        },
      },
    },
  },
  {
    $set: {
      price: {
        $cond: {
          if: { $not: { $eq: ["$price", "$currentPrice"] } },
          then: "$currentPrice",
          else: "$price",
        },
      },
      originalPrice: {
        $cond: {
          if: { $lt: ["$currentPrice", "$price"] },
          then: "$price",
          else: "$$REMOVE",
        },
      },
      campaign: {
        $cond: {
          if: { $lt: ["$currentPrice", "$price"] },
          then: "$campaign",
          else: "$$REMOVE",
        },
      },
    },
  },
  {
    $project: {
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
      currentPrice: 0,
      "campaign.__v": 0,
      "campaign.user": 0,
      "campaign.currentAmount": 0,
      "campaign.includeProducts": 0,
      "campaign.excludeProducts": 0,
      "campaign.includeProductsExpr": 0,
      "campaign.createdAt": 0,
      "campaign.updatedAt": 0,
      "campaign.amountTable": 0,
      "campaign.startDate": 0,
      "campaign.endDate": 0,
      "campaign.campaignType": 0,
      "campaign.status": 0,
    },
  },
  { $match: { _id: { $ne: "63cbba84a7041e92b062038a" }, fabric: "Silk" } },
  { $limit: 10 },
  {
    $lookup: {
      from: "63c9154fa7041e92b06202ef_Review",
      let: { p_id: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$product", "$$p_id"] } } },
        {
          $facet: {
            rating: [
              {
                $group: {
                  _id: null,
                  totalRating: { $sum: "$rating" },
                  totalReview: { $sum: 1 },
                },
              },
              {
                $set: {
                  rating: {
                    $multiply: [
                      5,
                      {
                        $divide: [
                          "$totalRating",
                          { $multiply: ["$totalReview", 5] },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
            breakdown: [
              { $group: { _id: "$rating", totalReview: { $sum: 1 } } },
            ],
          },
        },
      ],
      as: "reviews",
    },
  },
  { $set: { reviews: { $first: "$reviews" } } },
  {
    $set: {
      rating: { $first: "$reviews.rating" },
      ratingBreakdown: {
        $map: {
          input: "$reviews.breakdown",
          in: { rating: "$$this._id", total: "$$this.totalReview" },
        },
      },
    },
  },
  { $set: { rating: "$rating.rating", totalReview: "$rating.totalReview" } },
  { $unset: "reviews" },
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
];
