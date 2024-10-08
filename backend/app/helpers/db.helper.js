import { AdminCollection } from "../models/index.js";
import mongoose from "mongoose";
import { dbConn, getModel as getMongoModel } from "../models/index.js";

const Schema = mongoose.Schema;

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
    case "variantArray":
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
const getTypeStr = (field) => {
  let t;
  switch (field.dataType) {
    case "string":
    case "text":
      t = `Schema.Types.String`;
      break;
    case "number":
      t = `Schema.Types.Number`;
      break;
    case "date":
      t = `Schema.Types.Date`;
      break;
    case "boolean":
      t = `Schema.Types.Boolean`;
      break;
    case "array":
      t = `Schema.Types.Array`;
      break;
    case "objectId":
      t = `Schema.Types.ObjectId`;
      break;
    case "object":
      t = `Schema.Types.Object`;
      break;
    default:
  }
  return t;
};

const getFields = (fields) => {
  const _fields = {};
  fields.forEach((field) => {
    // add nested fields type if field is an object
    if (
      ["array", "variantArray"].includes(field.dataType) &&
      field.dataElementType === "object"
    ) {
      if (Array.isArray(field.fields) && field.fields.length) {
        _fields[field.name] = [new Schema(getFields(field.fields))];
      } else {
        _fields[field.name] = [];
      }
    } else {
      _fields[field.name] = {
        type: getType(field),
        required: field.required,
        ...(field.dataType === "objectId" && { ref: field.collection }),
        ...(field.unique && {
          unique: true,
          ...(!field.required && { sparse: true }),
        }),
      };
    }
  });
  return _fields;
};

const conns = {};

export const getModel = async ({ companyId, finPeriodId, name }) => {
  const Collection = getMongoModel({
    companyId,
    finPeriodId,
    name: "Collection",
  });
  const collection = await Collection.findOne({ name });

  if (!collection) {
    return {
      message: "Collection does not exist",
    };
  }
  const fields = getFields(collection.fields);

  const dbName = `${process.env.PRIMARY_DB}_${companyId}${
    finPeriodId ? "_" + finPeriodId : ""
  }`;
  if (!conns[dbName]) {
    conns[dbName] = dbConn.useDb(dbName, { useCache: true });
  }

  const tableName = "dynamic_" + name;
  if (conns[dbName].models[tableName]) {
    delete conns[dbName].models[tableName];
  }

  return {
    Model: conns[dbName].model(
      tableName,
      new Schema(fields, { timestamps: true }),
      tableName
    ),
    collection: { ...collection._doc, __name: tableName },
  };
};

export const getAdminModel = async (table) => {
  const collection = await AdminCollection.findOne({ name: table });
  if (!collection) {
    return {
      message: "Admin Collection does not exist",
    };
  }
  const fields = getFields(collection.fields);

  table = "Admin_" + table;

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

export const getDynamicPipeline = ({
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
              from: `dynamic_${field.collection}`,
              localField: field.name,
              foreignField: field.optionValue,
              as: field.name,
            },
          },
          // {
          //   $set: {
          //     author: {
          //       $cond: {
          //         if: { $gt: [{ $size: "$author" }, 0] },
          //         then: { $arrayElemAt: ["$author", 0] },
          //         else: null,
          //       },
          //     },
          //   },
          // },
        ]
      );
    });

  if (table === "Product") {
    pipeline.push(
      ...[
        {
          $lookup: {
            from: `dynamic_Campaign`,
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
                  includeProductExpr: {
                    $map: {
                      input: { $objectToArray: "$includeProducts" },
                      as: "filter",
                      in: {
                        $switch: {
                          branches: [
                            {
                              case: {
                                $eq: ["$$filter.v.filterType", "minMax"],
                              },
                              then: {
                                $reduce: {
                                  input: {
                                    $filter: {
                                      input: {
                                        $objectToArray: "$$product",
                                      },
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
                                                $gte: [
                                                  "$$this.v",
                                                  "$$filter.v.min",
                                                ],
                                              },
                                              {
                                                $lte: [
                                                  "$$this.v",
                                                  "$$filter.v.max",
                                                ],
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
                                $eq: [
                                  "$$filter.v.filterType",
                                  "stringContains",
                                ],
                              },
                              then: {
                                $reduce: {
                                  input: {
                                    $filter: {
                                      input: {
                                        $objectToArray: "$$product",
                                      },
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

export const getRatingPipeline = ({ business }) => {
  return [
    {
      $lookup: {
        from: `dynamic_Review`,
        let: { p_id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$product", "$$p_id"],
              },
            },
          },
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
        as: "reviews",
      },
    },
    { $set: { rating: { $first: "$reviews" } } },
    {
      $set: {
        rating: "$rating.rating" || 0,
        totalReview: "$rating.totalReview" || 0,
      },
    },
  ];
};

export const getRatingBreakdownPipeline = ({ business }) => {
  return [
    {
      $lookup: {
        from: `dynamic_Review`,
        let: { p_id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$product", "$$p_id"],
              },
            },
          },
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
                {
                  $group: {
                    _id: "$rating",
                    totalReview: { $sum: 1 },
                  },
                },
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
            in: {
              rating: "$$this._id",
              total: "$$this.totalReview",
            },
          },
        },
      },
    },
    {
      $set: {
        rating: "$rating.rating",
        totalReview: "$rating.totalReview",
      },
    },
    {
      $unset: "reviews",
    },
  ];
};

export const defaultSchemas = [
  {
    name: "Category",
    fields: [
      {
        unique: true,
        name: "name",
        required: true,
        label: "Name",
        dataType: "string",
        fieldType: "input",
        inputType: "text",
      },
      {
        unique: false,
        name: "order",
        required: false,
        label: "Order",
        dataType: "number",
        fieldType: "input",
        inputType: "number",
        decimalPlaces: "0",
      },
    ],
  },
  {
    name: "Subcategory",
    fields: [
      {
        unique: false,
        name: "category",
        required: false,
        label: "Category",
        dataType: "string",
        fieldType: "select",
        inputType: "text",
        multiple: false,
        optionType: "collection",
        collection: "Category",
        optionLabel: "name",
        optionValue: "name",
      },
      {
        unique: false,
        name: "name",
        required: true,
        label: "Name",
        dataType: "string",
        fieldType: "input",
        inputType: "text",
      },
    ],
  },
  {
    name: "Product",
    fields: [
      {
        unique: false,
        name: "category",
        required: false,
        label: "Category",
        dataType: "string",
        fieldType: "select",
        inputType: "text",
        multiple: false,
        optionType: "collection",
        collection: "Category",
        optionLabel: "name",
        optionValue: "name",
      },
      {
        unique: false,
        name: "subcategory",
        required: false,
        label: "Subcategory",
        dataType: "string",
        fieldType: "select",
        inputType: "text",
        multiple: false,
        optionType: "collection",
        collection: "Subcategory",
        optionLabel: "name",
        optionValue: "name",
      },
      {
        name: "title",
        required: true,
        label: "Title",
        dataType: "string",
        fieldType: "input",
        inputType: "text",
      },
      {
        name: "description",
        inputType: "text",
        dataType: "string",
        fieldType: "textarea",
        label: "Description",
        required: true,
      },
      {
        name: "images",
        required: true,
        label: "Images",
        dataType: "array",
        fieldType: "input",
        inputType: "file",
        dataElementType: "string",
        multiple: true,
      },
      {
        name: "price",
        inputType: "number",
        dataType: "number",
        fieldType: "input",
        label: "Price",
        required: true,
        decimalPlaces: "0.00",
      },
      {
        name: "whatsappNumber",
        required: true,
        label: "WhatsApp",
        dataType: "string",
        fieldType: "input",
        inputType: "phone",
      },
      {
        unique: false,
        name: "bestSeller",
        required: false,
        label: "Best Seller",
        dataType: "boolean",
        fieldType: "combobox",
        dataElementType: "string",
        multiple: false,
        optionType: "array",
        options: [
          {
            label: "No",
            value: false,
            _id: "6ee3aj8g",
          },
          {
            label: "Yes",
            value: true,
            _id: "x5zku4bb",
          },
        ],
      },
    ],
  },
  {
    name: "Campaign",
    fields: [
      {
        dataType: "string",
        fieldType: "input",
        inputType: "text",
        name: "title",
        label: "Title",
        required: true,
      },
      {
        name: "description",
        label: "Description",
        required: true,
        dataType: "string",
        fieldType: "textarea",
        inputType: "text",
      },
      {
        name: "startDate",
        label: "Start Date",
        required: true,
        dataType: "date",
        fieldType: "input",
        inputType: "date",
      },
      {
        name: "endDate",
        label: "End Date",
        required: true,
        dataType: "date",
        fieldType: "input",
        inputType: "date",
      },
      {
        name: "status",
        label: "Status",
        required: true,
        dataType: "string",
        fieldType: "combobox",
        inputType: "",
        optionType: "array",
        options: [
          {
            label: "Inactive",
            value: "inactive",
            _id: "ushaw7fp",
          },
          {
            label: "Active",
            value: "active",
            _id: "4uk2shs5",
          },
        ],
      },
      {
        name: "amountTable",
        required: false,
        label: "Amount Table",
        dataType: "array",
        fieldType: "input",
        dataElementType: "object",
        fields: [
          {
            name: "startDate",
            required: true,
            label: "Start Date",
            dataType: "date",
            fieldType: "input",
            inputType: "date",
            _id: "56797722",
          },
          {
            name: "endDate",
            required: true,
            label: "End Date",
            dataType: "date",
            fieldType: "input",
            inputType: "date",
            _id: "17165027",
          },
          {
            name: "amount",
            required: true,
            label: "Amount",
            dataType: "number",
            fieldType: "input",
            inputType: "number",
            _id: "81099445",
          },
          {
            name: "amountType",
            required: true,
            label: "Amount Type",
            dataType: "string",
            fieldType: "combobox",
            optionType: "array",
            options: [
              {
                label: "Flat",
                value: "flat",
                _id: "bd76kiee",
              },
              {
                label: "Percent",
                value: "percent",
                _id: "dvmblh8a",
              },
            ],
          },
        ],
      },
      {
        name: "includeProducts",
        required: false,
        label: "Include Products",
        dataType: "object",
        fieldType: "collectionFilter",
      },
      {
        name: "excludeProducts",
        required: false,
        label: "Exclude Products",
        dataType: "object",
        fieldType: "collectionFilter",
      },
    ],
  },
  {
    name: "Customer",
    fields: [
      {
        unique: false,
        name: "name",
        required: true,
        label: "Name",
        dataType: "string",
        fieldType: "input",
        inputType: "text",
      },
      {
        unique: true,
        name: "email",
        required: false,
        label: "Email",
        dataType: "string",
        fieldType: "input",
        inputType: "text",
      },
      {
        unique: true,
        name: "phone",
        required: false,
        label: "phone",
        dataType: "string",
        fieldType: "input",
        inputType: "text",
      },
      {
        unique: false,
        name: "password",
        required: true,
        label: "password",
        dataType: "string",
        fieldType: "input",
        inputType: "password",
      },
    ],
  },
  {
    name: "Review",
    fields: [
      {
        unique: false,
        name: "product",
        required: false,
        label: "Product",
        dataType: "objectId",
        collection: "Product",
        foreignField: "_id",
      },
      {
        name: "rating",
        inputType: "",
        dataType: "number",
        fieldType: "none",
        label: "Rating",
        required: false,
      },
      {
        name: "review",
        inputType: "",
        dataType: "string",
        fieldType: "textarea",
        label: "Review",
        required: false,
      },
      {
        name: "customer",
        dataType: "objectId",
        collection: "Customer",
        fieldType: "none",
        label: "Customer",
        required: false,
        foreignField: "_id",
      },
    ],
  },
  {
    name: "Order",
    fields: [
      {
        unique: false,
        name: "products",
        required: false,
        label: "Products",
        dataType: "array",
        dataElementType: "object",
        fields: [
          {
            name: "product",
            required: false,
            label: "Product",
            dataType: "object",
            fieldType: "select",
            inputType: "text",
            multiple: false,
            optionType: "collection",
            collection: "Product",
            optionLabel: "title",
            optionValue: "_id",
          },
          {
            unique: false,
            name: "qty",
            required: false,
            label: "Qty",
            dataType: "number",
            fieldType: "combobox",
            multiple: false,
            optionType: "array",
            options: [
              {
                label: "15",
                value: 15,
                _id: "amjsnfnz",
              },
              {
                label: "14",
                value: 14,
                _id: "jlo8iohd",
              },
              {
                label: "13",
                value: 13,
                _id: "vpfd5x2c",
              },
              {
                label: "12",
                value: 12,
                _id: "umdqdjj8",
              },
              {
                label: "11",
                value: 11,
                _id: "n5ftw6gg",
              },
              {
                label: "10",
                value: 10,
                _id: "5xazsmxr",
              },
              {
                label: "9",
                value: 9,
                _id: "ziqz26i4",
              },
              {
                label: "8",
                value: 8,
                _id: "xgui4t7l",
              },
              {
                label: "7",
                value: 7,
                _id: "0eb1wua6",
              },
              {
                label: "6",
                value: 6,
                _id: "oigkuv5m",
              },
              {
                label: "5",
                value: 5,
                _id: "z4kswzhc",
              },
              {
                label: "4",
                value: 4,
                _id: "w0riq1zh",
              },
              {
                label: "3",
                value: 3,
                _id: "1xsanxkc",
              },
              {
                label: "2",
                value: 2,
                _id: "z6mtpxj7",
              },
              {
                label: "1",
                value: 1,
                _id: "b2c26pzw",
              },
            ],
          },
          {
            unique: false,
            name: "color",
            required: false,
            label: "Color",
            dataType: "string",
            fieldType: "select",
            inputType: "text",
            multiple: false,
            optionType: "collection",
            collection: "Product color",
            optionLabel: "name",
            optionValue: "name",
          },
          {
            unique: false,
            name: "size",
            required: false,
            label: "Size",
            dataType: "string",
            fieldType: "combobox",
            multiple: false,
            optionType: "array",
            options: [
              {
                label: "Large",
                value: "L",
                _id: "h3kvzmhh",
              },
              {
                label: "Small",
                value: "S",
                _id: "sm8jo05s",
              },
              {
                label: "Medium",
                value: "M",
                _id: "ghxo5kn7",
              },
            ],
          },
          {
            unique: false,
            name: "variant",
            required: false,
            label: "Variant",
            dataType: "object",
            fieldType: "none",
            multiple: false,
          },
        ],
      },
      {
        name: "customer",
        inputType: "text",
        dataType: "objectId",
        dataElementType: "",
        dataElements: "",
        collection: "Customer",
        fieldType: "select",
        optionType: "collection",
        multiRange: "",
        label: "Customer",
        required: true,
        decimalPlaces: "",
        unique: "",
        multiple: false,
        optionLabel: "name",
        optionValue: "_id",
        foreignField: "_id",
      },
      {
        unique: false,
        name: "price",
        required: false,
        label: "Price",
        dataType: "number",
        fieldType: "none",
      },
      {
        name: "status",
        inputType: "",
        dataType: "string",
        dataElementType: "",
        dataElements: "",
        collection: "",
        fieldType: "combobox",
        optionType: "array",
        options: [
          {
            _id: "mjdbllxr",
            label: "Received",
            value: "received",
          },
          {
            _id: "cx54dm2323pq",
            label: "In Process",
            value: "inProcess",
          },
          {
            _id: "cx5423pq",
            label: "On Hold",
            value: "onHold",
          },
          {
            _id: "cx54dmpq",
            label: "Shipped",
            value: "shipped",
          },
          {
            _id: "8d5zic0h",
            label: "Returned",
            value: "complete",
          },
          {
            _id: "8d5zi323c0h",
            label: "Delivered",
            value: "complete",
          },
          {
            _id: "uqu5gc7z",
            label: "Cart",
            value: "cart",
          },
        ],
        multiRange: "",
        label: "Status",
        required: false,
        decimalPlaces: "",
        unique: "",
        multiple: false,
      },
      {
        name: "paymentMethod",
        inputType: "",
        dataType: "string",
        dataElementType: "",
        dataElements: "",
        collection: "",
        fieldType: "combobox",
        optionType: "array",
        options: [
          {
            label: "Cash on Delivery",
            value: "cod",
            _id: "mjdbllxr",
          },
          {
            label: "Prepaid",
            value: "prePaid",
            _id: "cx54dmpq",
          },
        ],
        multiRange: "",
        label: "Payment Method",
        required: false,
        decimalPlaces: "",
        unique: "",
        multiple: false,
      },
      {
        name: "paymentStatus",
        inputType: "",
        dataType: "string",
        dataElementType: "",
        dataElements: "",
        collection: "",
        fieldType: "combobox",
        optionType: "array",
        options: [
          {
            label: "Pending",
            value: "pending",
            _id: "mjdbllxr",
          },
          {
            label: "Paid",
            value: "paid",
            _id: "cx54dmpq",
          },
        ],
        multiRange: "",
        label: "Payment Status",
        required: false,
        decimalPlaces: "",
        unique: "",
        multiple: false,
      },
      {
        unique: false,
        name: "payOrderId",
        required: false,
        label: "Payorder ID",
        dataType: "string",
        fieldType: null,
        multiple: false,
        optionType: null,
      },
    ],
  },
];

export const getModuleModel = async ({ name, fields }) => {
  const getFields = (fields) => {
    const _fields = {};
    const rawFields = {};
    fields.forEach((field) => {
      // add nested fields type if field is an object
      if (field.dataType === "array" && field.dataElementType === "object") {
        if (Array.isArray(field.fields) && field.fields.length) {
          _fields[field.name] = [
            new Schema(getFields(field.fields).schemaFields, {
              timestamps: true,
            }),
          ];
          rawFields[field.name] = `[${getFields(field.fields).schemaStr}]`;
        } else {
          _fields[field.name] = [];
          rawFields[field.name] = `[]`;
        }
      } else {
        _fields[field.name] = {
          type: getType(field),
          required: field.required,
          ...(field.dataType === "objectId" &&
            field.coll && { ref: `${name}_${field.coll.name}` }),
          ...(field.unique && {
            unique: true,
            ...(!field.required && { sparse: true }),
          }),
        };
        rawFields[field.name] = `{ type: ${getTypeStr(field)}, required: ${(
          field.required || false
        ).toString()}${
          field.dataType === "objectId" && field.coll
            ? `, ref: "${name}_${field.coll.name}"`
            : " "
        }${
          field.unique
            ? `, unique: true${!field.required ? ", sparse: true" : " "}`
            : ""
        }}`;
      }
    });
    return {
      schemaFields: _fields,
      schemaStr: `new Schema(${Object.entries(rawFields).reduce(
        (p, [k, v], i, arr) =>
          `${i === 0 ? "{" : ""}${p}\n${k}: ${v},${
            i + 1 === arr.length ? `\n}` : ""
          }`,
        ""
      )}, { timestamps: true })`,
    };
  };
  const { schemaFields, schemaStr } = getFields(fields);

  if (mongoose.models[name]) {
    delete mongoose.models[name];
  }

  const schema = new Schema(schemaFields, { timestamps: true });
  return {
    collectionName: name,
    Model: mongoose.model(name, schema, name),
    schemaStr,
    // collection: { __name: name },
  };
};
