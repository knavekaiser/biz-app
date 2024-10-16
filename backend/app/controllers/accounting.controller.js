import { appConfig } from "../config/index.js";
import { getModel } from "../models/index.js";
import { ObjectId } from "mongodb";

const { responseFn, responseStr } = appConfig;

export const get = async (req, res) => {
  try {
    const Account = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Account",
    });

    const conditions = {};
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
    const Account = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Account",
    });

    new Account(req.body)
      .save()
      .then(async (data) => {
        responseFn.success(res, { data });
      })
      .catch((err) => {
        console.log(err);
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
    const Account = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Account",
    });

    Account.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
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
    const Account = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Account",
    });

    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }

    Account.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
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
  const getLookupStage = ({ from, as, type }) => ({
    $lookup: {
      from,
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
            "accountingEntries.type": type,
            "accountingEntries.dateTime": "$dateTime",
            "accountingEntries.createdAt": "$createdAt",
            "accountingEntries.updatedAt": "$updatedAt",
          },
        },
        {
          $replaceRoot: {
            newRoot: "$accountingEntries",
          },
        },
      ],
      as,
    },
  });
  return [
    { $limit: 1 },
    getLookupStage({ from: "invoices", as: "saleEntries", type: "Invoice" }),
    getLookupStage({
      from: "salesreturns",
      as: "salesReturnEntries",
      type: "Sales Return",
    }),
    getLookupStage({
      from: "purchases",
      as: "purchaseEntries",
      type: "Purchase",
    }),
    getLookupStage({
      from: "purchasereturns",
      as: "purchaseReturnEntries",
      type: "Purchase Return",
    }),
    getLookupStage({ from: "receipts", as: "receiptEntries", type: "Receipt" }),
    getLookupStage({ from: "payments", as: "paymentEntries", type: "Payment" }),
    getLookupStage({ from: "journals", as: "journalEntries", type: "Journal" }),
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
            "$journalEntries",
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
    const Account = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Account",
    });

    const entryConditions = {};
    const conditions = {};
    if (req.query.type) {
      conditions.type = req.query.type;
    }
    if (req.query.accountId) {
      conditions.accountId = ObjectId(req.query.accountId);
    }
    if (req.query.startDate && req.query.endDate) {
      conditions.dateTime = {
        $gte: new Date(req.query.startDate),
        $lt: new Date(req.query.endDate),
      };
    }
    Account.aggregate([
      ...entryPipeline(entryConditions),
      { $sort: { updatedAt: 1, index: 1 } },
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
    const Account = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Account",
    });

    const entryConditions = {};
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
      { $sort: { updatedAt: 1, index: 1 } },
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

const getAccounts = async ({ companyId, finPeriodId, accountId }) => {
  const Account = getModel({
    companyId,
    finPeriodId,
    name: "Account",
  });

  const allAccounts = [];
  await Account.find({
    parent: Array.isArray(accountId) ? { $in: accountId } : accountId,
  }).then(async (accounts) => {
    allAccounts.push(...accounts.filter((item) => !item.isGroup));
    if (accounts.some((item) => item.isGroup)) {
      allAccounts.push(
        ...(await getAccounts({
          companyId,
          finPeriodId,
          accountId: accounts
            .filter((item) => item.isGroup)
            .map((item) => item._id),
        }))
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
const getMonths = (startDate, endDate) => {
  const months = [];
  for (let i = 0; i < 100; i++) {
    const date = new Date(
      new Date(startDate).setMonth(new Date(startDate).getMonth() + i)
    );
    if (date > new Date(endDate)) {
      break;
    }
    months.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      label: `${monthNames[date.getMonth()]} ${`${date.getFullYear()}`.slice(
        2
      )}`,
      value: `${date.getFullYear()}-${date.getMonth()}`,
    });
  }
  return months;
};
export const monthlyAnalysys = async (req, res) => {
  try {
    const Account = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Account",
    });

    const accounts = req.query.accountId
      ? await getAccounts({
          companyId: (req.business || req.authUser)._id,
          finPeriodId: req.finPeriod._id,
          accountId: req.query.accountId,
        })
      : [];

    if (!accounts.length) {
      return responseFn.success(res, { data: [], months: [] });
    }

    const months = getMonths(req.finPeriod.startDate, req.finPeriod.endDate);
    const entryConditions = {};
    const conditions = {
      accountId: { $in: accounts.map((acc) => acc._id) },
      dateTime: {
        $gte: new Date(
          `${months[0].year}-${
            (months[0].month + 1) % 12 === 0 ? 12 : (months[0].month + 1) % 12
          }-01`
        ),
        $lt: new Date(
          `${months[months.length - 1].year}-${
            (months[months.length - 1].month + 2) % 12 === 0
              ? 12
              : (months[months.length - 1].month + 2) % 12
          }-01`
        ),
      },
    };
    if (req.query.startDate && req.query.endDate) {
      conditions.dateTime = {
        $gte: new Date(req.query.startDate),
        $lt: new Date(req.query.endDate),
      };
    }

    Account.aggregate([
      ...entryPipeline(entryConditions),
      { $match: conditions },
      {
        $group: {
          _id: "$accountId",
          accountName: { $first: "$accountName" },
          accountId: { $first: "$accountId" },
          entries: {
            $push: {
              dateTime: "$dateTime",
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
                  `${new Date(entry.dateTime).getFullYear()}-${new Date(
                    entry.dateTime
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
