import { appConfig } from "../config/index.js";
import { ObjectId } from "mongodb";
import { SalesReturn, Config, Account } from "../models/index.js";

const { responseFn, responseStr } = appConfig;

export const findAll = async (req, res) => {
  try {
    const conditions = {
      user: ObjectId(req.business?._id || req.authUser._id),
    };
    if (+req.query.no) {
      conditions.no = +req.query.no;
    }
    SalesReturn.aggregate([
      { $match: conditions },
      {
        $lookup: {
          from: "receipts",
          as: "due",
          let: { invNo: "$no" },
          pipeline: [
            {
              $match: {
                user: ObjectId(req.business?._id || req.authUser._id),
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

const generateEntries = async (body, comapny_id) => {
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
  const salesAccount = await Account.findOne({
    company: comapny_id,
    type: "Sales",
  });
  if (salesAccount) {
    accountingEntries.push({
      accountId: salesAccount._id,
      accountName: salesAccount.name,
      debit: totalCartPrice,
      credit: 0,
    });
  }
  const taxAccount = await Account.findOne({
    company: comapny_id,
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

export const create = async (req, res) => {
  try {
    const { nextSalesReturnNo } =
      (await Config.findOne({ user: req.business?._id || req.authUser._id })) ||
      {};

    req.body.accountingEntries = await generateEntries(
      req.body,
      req.business?._id || req.authUser._id
    );

    new SalesReturn({
      ...req.body,
      user: req.business?._id || req.authUser._id,
      no: nextSalesReturnNo || 1,
    })
      .save()
      .then(async (data) => {
        await Config.findOneAndUpdate(
          { user: req.business?._id || req.authUser._id },
          { $inc: { nextSalesReturnNo: 1 } },
          { new: true }
        );
        return responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    console.log(error);
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const update = async (req, res) => {
  try {
    delete req.body.no;

    req.body.accountingEntries = await generateEntries(
      req.body,
      req.business?._id || req.authUser._id
    );

    SalesReturn.findOneAndUpdate(
      { _id: req.params.id, user: req.business?._id || req.authUser._id },
      req.body,
      { new: true }
    )
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
    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    SalesReturn.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
      user: req.business?._id || req.authUser._id,
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
