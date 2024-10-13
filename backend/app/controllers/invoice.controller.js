import { appConfig } from "../config/index.js";
import { ObjectId } from "mongodb";
import { Config, getModel } from "../models/index.js";

const { responseFn, responseStr } = appConfig;

export const findAll = async (req, res) => {
  try {
    const Invoice = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Invoice",
    });

    const conditions = {};
    if (+req.query.no) {
      conditions.no = +req.query.no;
    }
    Invoice.aggregate([
      { $match: conditions },
      {
        $lookup: {
          from: "receipts",
          as: "due",
          let: { invNo: "$no" },
          pipeline: [
            {
              $match: {
                ...(conditions.no && { "invoices.no": conditions.no }),
              },
            },
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
    ])
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
      debit: totalCartPrice + tax,
      credit: 0,
    },
  ];
  const salesAccount = await Account.findOne({ type: "Sales" });
  if (salesAccount) {
    accountingEntries.push({
      accountId: salesAccount._id,
      accountName: salesAccount.name,
      debit: 0,
      credit: totalCartPrice,
    });
  }
  const taxAccount = await Account.findOne({ name: "Tax" });
  if (taxAccount) {
    accountingEntries.push({
      accountId: taxAccount._id,
      accountName: taxAccount.name,
      debit: 0,
      credit: tax,
    });
  }
  return accountingEntries;
};

const generateStockEntries = async (body, companyId, finPeriodId) => {
  const accountingEntries = body.items.map((item) => ({
    accountId: item.product._id,
    accountName: item.product.name,
    outward: item.qty,
    inward: 0,
  }));

  return accountingEntries;
};

export const create = async (req, res) => {
  try {
    const Invoice = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Invoice",
    });

    const { nextInvoiceNo } =
      (await Config.findOne({ user: req.business?._id || req.authUser._id })) ||
      {};

    req.body.accountingEntries = await generateEntries(
      req.body,
      req.business?._id || req.authUser._id,
      req.finPeriod._id
    );

    req.body.stockEntries = await generateStockEntries(
      req.body,
      req.business?._id || req.authUser._id,
      req.finPeriod._id
    );

    new Invoice({
      ...req.body,
      items: req.body.items.map((item) => ({
        ...item,
        product: item.product?._id,
      })),
      no: nextInvoiceNo || 1,
    })
      .save()
      .then(async (data) => {
        await Config.findOneAndUpdate(
          { user: req.business?._id || req.authUser._id },
          { $inc: { nextInvoiceNo: 1 } },
          { new: true }
        );
        return responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const update = async (req, res) => {
  try {
    const Invoice = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Invoice",
    });

    delete req.body.no;

    req.body.accountingEntries = await generateEntries(
      req.body,
      req.business?._id || req.authUser._id,
      req.finPeriod._id
    );

    Invoice.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
      .then((data) => {
        return responseFn.success(res, { data }, responseStr.record_updated);
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const Invoice = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Invoice",
    });

    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    Invoice.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
