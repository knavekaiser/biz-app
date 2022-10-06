const {
  authConfig,
  appConfig,
  appConfig: { responseFn, responseStr },
} = require("../config");
const Collection = require("../models/collection.model");

const getType = (field) => {
  let t;
  switch (field.dataType) {
    case "string":
    case "text":
      t = Schema.Types.String;
      break;
    case "number":
      t = Schema.Types.Number;
      break;
    case "date":
      t = Schema.Types.Date;
      break;
    case "boolean":
      t = Schema.Types.Boolean;
      break;
    case "array":
      t = Schema.Types.Array;
      break;
    case "objectId":
      t = Schema.Types.ObjectId;
      break;
    case "object":
      t = Schema.Types.Object;
      break;
    default:
  }
  return t;
};

exports.getDynamicPipeline = ({
  fields,
  pipeline = [],
  business_id,
  table,
}) => {
  fields
    .filter((item) => item.dataType === "objectId" && item.collection)
    .forEach((field) => {
      pipeline.push(
        ...[
          {
            $lookup: {
              from: `${business_id}_${field.collection}`,
              localField: field.name,
              foreignField: field.optionValue,
              as: field.name,
            },
          },
          {
            $set: {
              author: {
                $cond: {
                  if: { $gt: [{ $size: "$author" }, 0] },
                  then: { $arrayElemAt: ["$author", 0] },
                  else: null,
                },
              },
            },
          },
        ]
      );
    });

  if (table === "Product") {
    const expr = [];

    pipeline.push(
      ...[
        {
          $lookup: {
            from: `${business_id}_Campaign`,
            let: { product: "$$ROOT" },
            pipeline: [
              {
                $match: {
                  startDate: { $lt: new Date() },
                  endDate: { $gt: new Date() },
                  status: "active",
                },
              },
              {
                $unwind: {
                  path: "$amountTable",
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $match: {
                  "amountTable.startDate": { $lt: new Date() },
                  "amountTable.endDate": { $gt: new Date() },
                },
              },
              {
                $set: {
                  includeProductsExpr: {
                    $function: {
                      body: `function (product, campaign) {
                    let result = true;
                    for (let key in campaign.includeProducts) {
                      const args = campaign.includeProducts[key];
                      if (args.filterType === "minMax") {
                        if (
                          product.price < args.min ||
                          product.price > args.max
                        ) {
                          result = false;
                          break;
                        }
                      } else if (args.filterType === "stringContains") {
                        if (!new RegExp(args.text, "i").test(product[key])) {
                          result = false;
                          break;
                        }
                      }
                    }
                    return result;
                  }`,
                      args: ["$$product", "$$ROOT"],
                      lang: "js",
                    },
                  },
                },
              },
              { $match: { includeProductsExpr: true } },
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
                    case: {
                      $eq: ["$campaign.amountTable.amountType", "flat"],
                    },
                    then: {
                      $add: ["$price", "$campaign.amountTable.amount"],
                    },
                  },
                  {
                    case: {
                      $eq: ["$campaign.amountTable.amountType", "percent"],
                    },
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
      ]
    );
  }

  return pipeline;
};

exports.getModel = async (table) => {
  const [_id, name] = table.split("_");
  const collection = await Collection.findOne({ name, user: _id });
  const getFields = (fields) => {
    const _fields = {};
    fields.forEach((field) => {
      // add nested fields type if field is an object
      if (field.dataType === "array" && field.dataElementType === "object") {
        _fields[field.name] = [new Schema(getFields(field.fields))];
      } else {
        _fields[field.name] = {
          type: getType(field),
          required: field.required,
          ...(field.dataType === "objectId" && { ref: field.collection }),
        };
      }
    });
    return _fields;
  };
  if (!collection) {
    return {
      message: "Collection does not exist",
    };
  }
  const fields = getFields(collection.fields);

  if (mongoose.models[table]) {
    // remove and redefine the model
  }

  if (mongoose.models[table]) {
    delete mongoose.models[table];
  }

  return {
    Model: mongoose.model(
      table,
      new Schema(fields, { timestamps: true }),
      table
    ),
    collection: { ...collection._doc, __name: table },
  };
};
