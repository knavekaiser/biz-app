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
      customer: { $first: "$customer" },
      branch: { $first: "$branch" },
    },
  },
  {
    $lookup: {
      from: "receipts",
      as: "due",
      let: { invNo: "$no" },
      pipeline: [
        { $match: { ...(conditions.no && { "invoices.no": conditions.no }) } },
        {
          $unwind: {
            path: "$invoices",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            receipt_id: "$_id",
            _id: "$invoices._id",
            no: "$invoices.no",
            amount: "$invoices.amount",
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
  {
    $set: {
      status: {
        $switch: {
          branches: [
            { case: { $eq: ["$paid", 0] }, then: "pending" },
            { case: { $eq: ["$due", 0] }, then: "complete" },
            { case: { $gt: ["$paid", 0] }, then: "due" },
          ],
          default: "pending",
        },
      },
    },
  },
  { $project: { __v: 0 } },
];
export const findAll = async (req, res) => {
  try {
    const SalesReturn = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "SalesReturn",
    });

    const conditions = {};
    if (+req.query.no) {
      conditions.no = +req.query.no;
    }
    SalesReturn.aggregate([{ $match: conditions }, ...pipeline(conditions)])
      .then((data) => {
        responseFn.success(res, { data });
      })
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
  const tax = totalCartPrice.percent(body.gst) || 0;
  const accountingEntries = [
    {
      accountId: ObjectId(body.accountId),
      accountName: body.accountName,
      debit: 0,
      credit: totalCartPrice + tax,
    },
  ];
  const salesAccount = await Account.findOne({ type: "Sales" });
  if (salesAccount) {
    accountingEntries.push({
      accountId: salesAccount._id,
      accountName: salesAccount.name,
      debit: totalCartPrice,
      credit: 0,
    });
  }
  const taxAccount = await Account.findOne({ name: "Tax" });
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
    const SalesReturn = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "SalesReturn",
    });

    const { nextSalesReturnNo } =
      (await Config.findOne({ user: req.business?._id || req.authUser._id })) ||
      {};

    req.body.accountingEntries = await generateEntries(
      req.body,
      req.business?._id || req.authUser._id,
      req.finPeriod._id
    );
    req.body.stockEntries = await generateStockEntries(req.body);

    new SalesReturn({
      ...req.body,
      no: nextSalesReturnNo || 1,
    })
      .save()
      .then(async (data) => {
        await Config.findOneAndUpdate(
          { user: req.business?._id || req.authUser._id },
          { $inc: { nextSalesReturnNo: 1 } },
          { new: true }
        );
        const newInvoice = await SalesReturn.aggregate([
          { $match: { _id: data._id } },
          ...pipeline(),
        ]);
        return responseFn.success(res, { data: newInvoice[0] });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    console.log(error);
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const update = async (req, res) => {
  try {
    const SalesReturn = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "SalesReturn",
    });

    delete req.body.no;

    req.body.accountingEntries = await generateEntries(
      req.body,
      req.business?._id || req.authUser._id,
      req.finPeriod._id
    );
    req.body.stockEntries = await generateStockEntries(req.body);

    SalesReturn.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
    })
      .then(async (data) => {
        const newInvoice = await SalesReturn.aggregate([
          { $match: { _id: data._id } },
          ...pipeline(),
        ]);
        return responseFn.success(
          res,
          { data: newInvoice[0] },
          responseStr.record_updated
        );
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const SalesReturn = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "SalesReturn",
    });

    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    SalesReturn.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
