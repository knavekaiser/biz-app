import { appConfig } from "../config/index.js";
import { ObjectId } from "mongodb";
import { PurchaseReturn, Config, Account } from "../models/index.js";

const { responseFn, responseStr } = appConfig;

export const findAll = async (req, res) => {
  try {
    const conditions = {
      user: ObjectId(req.business?._id || req.authUser._id),
    };
    if (+req.query.no) {
      conditions.no = +req.query.no;
    }
    PurchaseReturn.aggregate([
      { $match: conditions },
      {
        $lookup: {
          from: "payments",
          as: "due",
          let: { invNo: "$no" },
          pipeline: [
            {
              $match: {
                user: ObjectId(req.business?._id || req.authUser._id),
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
    ])
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

const generateEntries = async (body, company_id) => {
  const totalCartPrice = body.items.reduce((p, c) => p + c.price * c.qty, 0);
  const tax = totalCartPrice.percent(body.gst);
  const accountingEntries = [
    {
      accountId: ObjectId(body.accountId),
      accountName: body.accountName,
      debit: totalCartPrice + tax,
      credit: 0,
    },
  ];
  const purchaseAccount = await Account.findOne({
    company: company_id,
    type: "Purchase",
  });
  if (purchaseAccount) {
    accountingEntries.push({
      accountId: purchaseAccount._id,
      accountName: purchaseAccount.name,
      debit: 0,
      credit: totalCartPrice,
    });
  }
  const taxAccount = await Account.findOne({
    company: company_id,
    name: "Tax",
  });
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
export const create = async (req, res) => {
  try {
    const { nextPurchaseReturnNo } =
      (await Config.findOne({ user: req.business?._id || req.authUser._id })) ||
      {};

    req.body.accountingEntries = await generateEntries(
      req.body,
      req.business?._id || req.autHUser._id
    );

    new PurchaseReturn({
      ...req.body,
      user: req.business?._id || req.authUser._id,
      no: nextPurchaseReturnNo || 1,
    })
      .save()
      .then(async (data) => {
        await Config.findOneAndUpdate(
          { user: req.business?._id || req.authUser._id },
          { $inc: { nextPurchaseReturnNo: 1 } },
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
    delete req.body.no;
    req.body.accountingEntries = await generateEntries(
      req.body,
      req.business?._id || req.authUser._id
    );
    PurchaseReturn.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
    })
      .then((data) => {
        return responseFn.success(res, { data }, responseStr.record_updated);
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const deletePruchase = async (req, res) => {
  try {
    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    PurchaseReturn.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
