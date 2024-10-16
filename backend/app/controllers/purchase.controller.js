import { appConfig } from "../config/index.js";
import { ObjectId } from "mongodb";
import { Config, getModel } from "../models/index.js";

const { responseFn, responseStr } = appConfig;

const pipeline = (conditions = {}) => [
  {
    $unwind: {
      path: "$items",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: "inventories",
      localField: "items.product",
      foreignField: "_id",
      as: "items.product",
    },
  },
  {
    $unwind: {
      path: "$items.product",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $group: {
      _id: "$_id",
      no: { $first: "$no" },
      dateTime: { $first: "$dateTime" },
      gst: { $first: "$gst" },
      items: {
        $push: {
          _id: "$items._id",
          price: "$items.price",
          qty: "$items.qty",
          unit: "$items.unit",
          product: {
            _id: "$items.product._id",
            name: "$items.product.name",
          },
        },
      },
      accountingEntries: { $first: "$accountingEntries" },
      createdAt: { $first: "$createdAt" },
      updatedAt: { $first: "$updatedAt" },
      vendor: { $first: "$vendor" },
      branch: { $first: "$branch" },
    },
  },
  {
    $lookup: {
      from: "payments",
      as: "due",
      let: { invNo: "$no" },
      pipeline: [
        {
          $match: {
            ...(conditions.no && { "purchases.no": conditions.no }),
          },
        },
        {
          $unwind: {
            path: "$purchases",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            receipt_id: "$_id",
            _id: "$purchases._id",
            no: "$purchases.no",
            amount: "$purchases.amount",
          },
        },
        {
          $match: {
            $expr: {
              $eq: ["$no", "$$invNo"],
            },
          },
        },
      ],
    },
  },
  {
    $set: {
      paid: {
        $reduce: {
          input: "$due",
          initialValue: 0,
          in: { $add: ["$$value", "$$this.amount"] },
        },
      },
      due: {
        $subtract: [
          {
            $reduce: {
              input: "$items",
              initialValue: 0,
              in: {
                $add: [
                  {
                    $add: [
                      { $multiply: ["$$this.price", "$$this.qty"] },
                      {
                        $multiply: [
                          {
                            $divide: [
                              { $multiply: ["$$this.price", "$$this.qty"] },
                              100,
                            ],
                          },
                          "$gst",
                        ],
                      },
                    ],
                  },

                  "$$value",
                ],
              },
            },
          },
          {
            $reduce: {
              input: "$due",
              initialValue: 0,
              in: { $add: ["$$value", "$$this.amount"] },
            },
          },
        ],
      },
    },
  },
  { $project: { __v: 0 } },
];
export const findAll = async (req, res) => {
  try {
    const Purchase = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Purchase",
    });
    const conditions = {};
    if (+req.query.no) {
      conditions.no = +req.query.no;
    }
    Purchase.aggregate([{ $match: conditions }, ...pipeline(conditions)])
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

const generateEntries = async (body, companyId, finPeriodId) => {
  const Account = getModel({
    companyId,
    finPeriodId,
    name: "Account",
  });

  const totalCartPrice = body.items.reduce((p, c) => p + c.price * c.qty, 0);
  const tax = totalCartPrice.percent(body.gst);
  const accountingEntries = [
    {
      accountId: ObjectId(body.accountId),
      accountName: body.accountName,
      debit: 0,
      credit: totalCartPrice + tax,
    },
  ];
  const purchaseAccount = await Account.findOne({
    company: companyId,
    type: "Purchase",
  });
  if (purchaseAccount) {
    accountingEntries.push({
      accountId: purchaseAccount._id,
      accountName: purchaseAccount.name,
      debit: totalCartPrice,
      credit: 0,
    });
  }
  const taxAccount = await Account.findOne({
    company: companyId,
    name: "Tax",
  });
  if (taxAccount) {
    accountingEntries.push({
      accountId: taxAccount._id,
      accountName: taxAccount.name,
      debit: tax,
      credit: 0,
    });
  }
  return accountingEntries;
};
const generateStockEntries = async (body) => {
  const accountingEntries = body.items.map((item) => ({
    accountId: item.product._id,
    accountName: item.product.name,
    outward: 0,
    inward: item.qty,
  }));

  return accountingEntries;
};

export const create = async (req, res) => {
  try {
    const Purchase = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Purchase",
    });

    const { nextPurchaseNo } =
      (await Config.findOne({ user: req.business?._id || req.authUser._id })) ||
      {};

    req.body.accountingEntries = await generateEntries(
      req.body,
      req.business?._id || req.authUser._id,
      req.finPeriod._id
    );
    req.body.stockEntries = await generateStockEntries(req.body);

    new Purchase({
      ...req.body,
      no: nextPurchaseNo || 1,
    })
      .save()
      .then(async (data) => {
        await Config.findOneAndUpdate(
          { user: req.business?._id || req.authUser._id },
          { $inc: { nextPurchaseNo: 1 } },
          { new: true }
        );
        const newRec = await Purchase.aggregate([
          { $match: { _id: data._id } },
          ...pipeline(),
        ]);
        return responseFn.success(res, { data: newRec[0] });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const update = async (req, res) => {
  try {
    const Purchase = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Purchase",
    });

    delete req.body.no;
    req.body.accountingEntries = await generateEntries(
      req.body,
      req.business?._id || req.authUser._id,
      req.finPeriod._id
    );
    req.body.stockEntries = await generateStockEntries(req.body);

    Purchase.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
      .then(async (data) => {
        const newRec = await Purchase.aggregate([
          { $match: { _id: data._id } },
          ...pipeline(),
        ]);
        return responseFn.success(
          res,
          { data: newRec[0] },
          responseStr.record_updated
        );
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const deletePruchase = async (req, res) => {
  try {
    const Purchase = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Purchase",
    });

    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    Purchase.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
