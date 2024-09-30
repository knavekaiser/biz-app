import { appConfig } from "../config/index.js";
import { Account } from "../models/index.js";
import { ObjectId } from "mongodb";

const { responseFn, responseStr } = appConfig;

export const get = async (req, res) => {
  try {
    const conditions = { company: req.business?._id || req.authUser._id };
    if (req.params.id) {
      conditions._id = req.params.id;
    }
    if (req.query.name) {
      conditions.name = { $regex: req.query.name, $options: "i" };
    }
    if (req.query.isGroup) {
      conditions.isGroup = req.query.isGroup === "true";
    }
    if (req.query.type) {
      conditions.type = req.query.type;
    }
    if (req.query.parent) {
      conditions.parent = ObjectId(req.query.parent);
    }
    if (req.query.types) {
      conditions.type = { $in: req.query.types.split(",") };
    }

    let pipeline = [
      { $match: conditions },
      {
        $lookup: {
          from: "accounts",
          localField: "_id",
          foreignField: "parent",
          as: "totalChildren",
        },
      },
      { $set: { totalChildren: { $size: "$totalChildren" } } },
    ];

    Account.aggregate(pipeline)
      .then((data) => {
        responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    console.log(error);
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const create = async (req, res) => {
  try {
    new Account({ ...req.body, company: req.business?._id || req.authUser._id })
      .save()
      .then(async (data) => {
        responseFn.success(res, { data });
      })
      .catch((err) => {
        if (err.code === 11000) {
          return responseFn.error(
            res,
            {},
            err.message.replace(/.*?({.*)/, "$1") + " already exists."
          );
        }
        responseFn.error(res, {}, err.message);
      });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const update = async (req, res) => {
  try {
    Account.findOneAndUpdate(
      { _id: req.params.id, company: req.business?._id || req.authUser._id },
      { ...req.body },
      { new: true }
    )
      .then(async (data) => {
        responseFn.success(res, { data }, responseStr.record_updated);
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const remove = async (req, res) => {
  try {
    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }

    Account.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
      company: req.business?._id || req.authUser._id,
    })
      .then((num) => {
        responseFn.success(res, {}, responseStr.record_deleted);
      })
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

const entryPipeline = (entryConditions) => {
  return [
    { $limit: 1 },
    {
      $lookup: {
        from: "invoices",
        pipeline: [
          {
            $unwind: {
              path: "$accountingEntries",
              includeArrayIndex: "accountingEntries.index",
              preserveNullAndEmptyArrays: false,
            },
          },
          { $match: entryConditions },
          {
            $set: {
              "accountingEntries.rec_id": "$_id",
              "accountingEntries.no": "$no",
              "accountingEntries.type": "Invoice",
              "accountingEntries.createdAt": "$createdAt",
            },
          },
          {
            $replaceRoot: {
              newRoot: "$accountingEntries",
            },
          },
        ],
        as: "saleEntries",
      },
    },
    {
      $lookup: {
        from: "salesreturns",
        pipeline: [
          {
            $unwind: {
              path: "$accountingEntries",
              includeArrayIndex: "accountingEntries.index",
              preserveNullAndEmptyArrays: false,
            },
          },
          { $match: entryConditions },
          {
            $set: {
              "accountingEntries.rec_id": "$_id",
              "accountingEntries.no": "$no",
              "accountingEntries.type": "Sales Return",
              "accountingEntries.createdAt": "$createdAt",
            },
          },
          {
            $replaceRoot: {
              newRoot: "$accountingEntries",
            },
          },
        ],
        as: "salesReturnEntries",
      },
    },
    {
      $lookup: {
        from: "purchases",
        pipeline: [
          {
            $unwind: {
              path: "$accountingEntries",
              includeArrayIndex: "accountingEntries.index",
              preserveNullAndEmptyArrays: false,
            },
          },
          { $match: entryConditions },
          {
            $set: {
              "accountingEntries.rec_id": "$_id",
              "accountingEntries.no": "$no",
              "accountingEntries.type": "Purchase",
              "accountingEntries.createdAt": "$createdAt",
            },
          },
          {
            $replaceRoot: {
              newRoot: "$accountingEntries",
            },
          },
        ],
        as: "purchaseEntries",
      },
    },
    {
      $lookup: {
        from: "purchasereturns",
        pipeline: [
          {
            $unwind: {
              path: "$accountingEntries",
              includeArrayIndex: "accountingEntries.index",
              preserveNullAndEmptyArrays: false,
            },
          },
          { $match: entryConditions },
          {
            $set: {
              "accountingEntries.rec_id": "$_id",
              "accountingEntries.no": "$no",
              "accountingEntries.type": "Purchase Return",
              "accountingEntries.createdAt": "$createdAt",
            },
          },
          {
            $replaceRoot: {
              newRoot: "$accountingEntries",
            },
          },
        ],
        as: "purchaseReturnEntries",
      },
    },
    {
      $lookup: {
        from: "receipts",
        pipeline: [
          {
            $unwind: {
              path: "$accountingEntries",
              includeArrayIndex: "accountingEntries.index",
              preserveNullAndEmptyArrays: false,
            },
          },
          { $match: entryConditions },
          {
            $set: {
              "accountingEntries.rec_id": "$_id",
              "accountingEntries.no": "$no",
              "accountingEntries.type": "Receipt",
              "accountingEntries.createdAt": "$createdAt",
            },
          },
          {
            $replaceRoot: {
              newRoot: "$accountingEntries",
            },
          },
        ],
        as: "receiptEntries",
      },
    },
    {
      $lookup: {
        from: "payments",
        pipeline: [
          {
            $unwind: {
              path: "$accountingEntries",
              includeArrayIndex: "accountingEntries.index",
              preserveNullAndEmptyArrays: false,
            },
          },
          { $match: entryConditions },
          {
            $set: {
              "accountingEntries.rec_id": "$_id",
              "accountingEntries.no": "$no",
              "accountingEntries.type": "Payment",
              "accountingEntries.createdAt": "$createdAt",
            },
          },
          {
            $replaceRoot: {
              newRoot: "$accountingEntries",
            },
          },
        ],
        as: "paymentEntries",
      },
    },
    {
      $set: {
        saleEntries: null,
        purchaseEntries: null,
        receiptEntries: null,
        paymentEntries: null,
        entries: {
          $concatArrays: [
            "$saleEntries",
            "$salesReturnEntries",
            "$purchaseEntries",
            "$purchaseReturnEntries",
            "$receiptEntries",
            "$paymentEntries",
          ],
        },
      },
    },
    { $unwind: { path: "$entries" } },
    { $replaceRoot: { newRoot: "$entries" } },
  ];
};

export const vouchers = async (req, res) => {
  try {
    const entryConditions = {
      user: req.business?._id || req.authUser._id,
    };
    const conditions = {};
    if (req.query.type) {
      conditions.type = req.query.type;
    }
    if (req.query.accountId) {
      conditions.accountId = ObjectId(req.query.accountId);
    }
    if (req.query.startDate && req.query.endDate) {
      conditions.createdAt = {
        $gte: new Date(req.query.startDate),
        $lt: new Date(req.query.endDate),
      };
    }
    Account.aggregate([
      ...entryPipeline(entryConditions),
      { $sort: { createdAt: 1, index: 1 } },
      { $match: conditions },
    ]).then((data) => {
      return responseFn.success(res, { data });
    });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const getJournals = async (req, res) => {
  try {
    const entryConditions = {
      user: req.business?._id || req.authUser._id,
    };
    const conditions = {};
    if (req.query.type) {
      conditions.type = req.query.type;
    }
    if (req.query.accountIds) {
      conditions.accountId = {
        $in: req.query.accountIds.split(",").map((_id) => ObjectId(_id)),
      };
    }
    Account.aggregate([
      ...entryPipeline(entryConditions),
      { $sort: { createdAt: 1, index: 1 } },
      { $match: conditions },
      {
        $group: {
          _id: "$accountId",
          accountName: { $first: "$accountName" },
          debit: { $sum: "$debit" },
          credit: { $sum: "$credit" },
        },
      },
    ]).then((data) => {
      return responseFn.success(res, { data });
    });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

const getAccounts = async (accountId) => {
  const allAccounts = [];
  await Account.find({
    parent: Array.isArray(accountId) ? { $in: accountId } : accountId,
  }).then(async (accounts) => {
    allAccounts.push(...accounts.filter((item) => !item.isGroup));
    if (accounts.some((item) => item.isGroup)) {
      allAccounts.push(
        ...(await getAccounts(
          accounts.filter((item) => item.isGroup).map((item) => item._id)
        ))
      );
    }
  });
  return allAccounts.sort((a, b) => (a.name > b.name ? 1 : -1));
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const getLast12Months = () => {
  const months = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(new Date().setMonth(new Date().getMonth() - i));
    months.push({
      label: `${monthNames[date.getMonth()]} ${`${date.getFullYear()}`.slice(
        2
      )}`,
      value: `${date.getFullYear()}-${date.getMonth()}`,
    });
  }
  return months.reverse();
};
export const monthlyAnalysys = async (req, res) => {
  try {
    const accounts = req.query.accountId
      ? await getAccounts(req.query.accountId)
      : [];

    if (!accounts.length) {
      return responseFn.success(res, { data: [], months: [] });
    }

    const entryConditions = {
      user: req.business?._id || req.authUser._id,
    };
    const conditions = {
      accountId: { $in: accounts.map((acc) => acc._id) },
    };
    if (req.query.startDate && req.query.endDate) {
      conditions.createdAt = {
        $gte: new Date(req.query.startDate),
        $lt: new Date(req.query.endDate),
      };
    }
    const months = getLast12Months();
    Account.aggregate([
      ...entryPipeline(entryConditions),
      { $match: conditions },
      { $match: { accountId: { $in: accounts.map((item) => item._id) } } },
      {
        $group: {
          _id: "$accountId",
          accountName: { $first: "$accountName" },
          accountId: { $first: "$accountId" },
          entries: {
            $push: {
              createdAt: "$createdAt",
              debit: "$debit",
              credit: "$credit",
            },
          },
        },
      },
      { $sort: { accountName: 1 } },
    ]).then((data) => {
      return responseFn.success(res, {
        data: accounts.map((acc) => {
          const row = data.find(
            (item) => item.accountId.toString() === acc._id.toString()
          );
          return {
            _id: acc._id,
            name: acc.name,
            openingBalance: acc.openingBalance,
            entries: months.map((month) =>
              (row?.entries || []).filter(
                (entry) =>
                  month.value ===
                  `${new Date(entry.createdAt).getFullYear()}-${new Date(
                    entry.createdAt
                  ).getMonth()}`
              )
            ),
          };
        }),
        months,
      });
    });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
