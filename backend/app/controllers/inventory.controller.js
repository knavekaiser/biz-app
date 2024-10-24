import { appConfig } from "../config/index.js";
import { getModel } from "../models/index.js";
import { ObjectId } from "mongodb";

const { responseFn, responseStr } = appConfig;

export const get = async (req, res) => {
  try {
    const Inventory = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Inventory",
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
    if (req.query.branch) {
      conditions[`openingStocks.branch`] = ObjectId(req.query.branch);
    }

    let pipeline = [
      { $match: conditions },
      {
        $lookup: {
          from: "inventories",
          localField: "_id",
          foreignField: "parent",
          as: "totalChildren",
        },
      },
      { $set: { totalChildren: { $size: "$totalChildren" } } },
    ];

    Inventory.aggregate(pipeline)
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
    const Inventory = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Inventory",
    });

    new Inventory(req.body)
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
    const Inventory = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Inventory",
    });

    Inventory.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
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
    const Inventory = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Inventory",
    });

    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }

    Inventory.deleteMany({
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
            path: "$stockEntries",
            includeArrayIndex: "stockEntries.index",
            preserveNullAndEmptyArrays: false,
          },
        },
        { $match: entryConditions },
        {
          $set: {
            "stockEntries.rec_id": "$_id",
            "stockEntries.no": "$no",
            "stockEntries.type": type,
            "stockEntries.dateTime": "$dateTime",
            "stockEntries.createdAt": "$createdAt",
            "stockEntries.updatedAt": "$updatedAt",
          },
        },
        {
          $replaceRoot: {
            newRoot: "$stockEntries",
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
          ],
        },
      },
    },
    { $unwind: { path: "$entries" } },
    { $replaceRoot: { newRoot: "$entries" } },
    {
      $lookup: {
        from: "inventories",
        localField: "accountId",
        foreignField: "_id",
        as: "account",
      },
    },
    {
      $set: {
        accountName: {
          $getField: {
            input: { $first: "$account" },
            field: "name",
          },
        },
      },
    },
    { $unset: "account" },
  ];
};

export const listing = async (req, res) => {
  try {
    const Inventory = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Inventory",
    });

    const entryConditions = {};
    if (req.query.branch) {
      entryConditions.branch = ObjectId(req.query.branch);
    }
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

    Inventory.aggregate([
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

export const getLedgers = async (req, res) => {
  try {
    const Inventory = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Inventory",
    });

    const entryConditions = {};
    if (req.query.branch) {
      entryConditions.branch = ObjectId(req.query.branch);
    }
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

    const openingBalance = req.query.branch
      ? await Inventory.aggregate([
          {
            $unwind: {
              path: "$openingStocks",
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $set: {
              "rec.accountId": "$_id",
              "rec.accountName": "$name",
              "rec.branchId": "$openingStocks.branch",
              "rec.openingBalance": "$openingStocks.openingStock",
            },
          },
          { $replaceRoot: { newRoot: "$rec" } },
          { $match: { branchId: ObjectId(req.query.branch) } },
        ])
      : 0;

    const openingStock = conditions.dateTime
      ? await Inventory.aggregate([
          ...entryPipeline(entryConditions),
          {
            $match: {
              accountId: ObjectId(req.query.accountId),
              dateTime: { $lt: new Date(req.query.startDate) },
            },
          },
          {
            $lookup: {
              from: "inventories",
              foreignField: "_id",
              localField: "accountId",
              as: "rec",
            },
          },
          {
            $set: {
              rec: {
                $getField: {
                  input: { $first: "$rec" },
                  field: "openingStocks",
                },
              },
            },
          },
          {
            $group: {
              _id: "$accountId",
              inward: { $sum: "$inward" },
              outward: { $sum: "$outward" },
            },
          },
        ]).then(
          ([stock]) =>
            (openingBalance.find(
              (item) => item.accountId.toString() === req.query.accountId
            )?.openingBalance || 0) +
            ((stock?.inward || 0) - (stock?.outward || 0))
        )
      : openingBalance.find(
          (item) => item.accountId.toString() === req.query.accountId
        )?.openingBalance || 0;

    Inventory.aggregate([
      ...entryPipeline(entryConditions),
      { $sort: { updatedAt: 1, index: 1 } },
      { $match: conditions },
    ]).then((data) => {
      return responseFn.success(res, { data, openingStock });
    });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

const getAccounts = async ({ companyId, finPeriodId, accountId }) => {
  const Inventory = getModel({
    companyId,
    finPeriodId,
    name: "Inventory",
  });

  const allAccounts = [];
  await Inventory.find({
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
    const Inventory = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Inventory",
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

    let months = [];
    if (req.query.startDate && req.query.endDate) {
      months = getMonths(req.query.startDate, req.query.endDate);
    } else {
      months = getMonths(req.finPeriod.startDate, req.finPeriod.endDate);
    }
    const entryConditions = {};
    if (req.query.branch) {
      entryConditions.branch = ObjectId(req.query.branch);
    }
    let startDate = new Date(`${months[0].year}-${months[0].month}-01`);
    startDate = new Date(startDate.setMonth(months[0].month));
    let endDate = new Date(
      `${months[months.length - 1].year}-${months[months.length - 1].month}-01`
    );
    endDate = new Date(endDate.setMonth(months[months.length - 1].month + 1));
    const conditions = {
      accountId: { $in: accounts.map((acc) => acc._id) },
      dateTime: { $gte: startDate, $lt: endDate },
    };
    if (req.query.startDate && req.query.endDate) {
      conditions.dateTime = {
        $gte: new Date(req.query.startDate),
        $lt: new Date(req.query.endDate),
      };
    }

    const openingBalance = req.query.branch
      ? await Inventory.aggregate([
          {
            $unwind: {
              path: "$openingStocks",
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $set: {
              "rec.accountId": "$_id",
              "rec.accountName": "$name",
              "rec.branchId": "$openingStocks.branch",
              "rec.openingBalance": "$openingStocks.openingStock",
            },
          },
          { $replaceRoot: { newRoot: "$rec" } },
          { $match: { branchId: ObjectId(req.query.branch) } },
        ])
      : 0;

    const openingStocks = await Inventory.aggregate([
      ...entryPipeline(entryConditions),
      {
        $match: {
          accountId: { $in: accounts.map((acc) => acc._id) },
          dateTime: { $lt: startDate },
        },
      },
      {
        $lookup: {
          from: "inventories",
          foreignField: "_id",
          localField: "accountId",
          as: "rec",
        },
      },
      {
        $set: {
          rec: {
            $getField: {
              input: { $first: "$rec" },
              field: "openingStocks",
            },
          },
        },
      },
      {
        $group: {
          _id: "$accountId",
          inward: { $sum: "$inward" },
          outward: { $sum: "$outward" },
        },
      },
    ]).then((data) =>
      accounts.reduce((p, c) => {
        const stock = data.find(
          (item) => item._id.toString() === c._id.toString()
        );
        p[c._id] =
          (openingBalance.find(
            (item) => item.accountId.toString() === c._id.toString()
          )?.openingBalance || 0) +
          ((stock?.inward || 0) - (stock?.outward || 0));
        return p;
      }, {})
    );

    Inventory.aggregate([
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
              outward: "$outward",
              inward: "$inward",
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
            openingStock: acc.openingStock,
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
        openingStocks,
      });
    });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const locations = async (req, res) => {
  try {
    const Inventory = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Inventory",
    });

    const conditions = {};
    if (req.query.name) {
      conditions.name = { $regex: req.query.name, $options: "i" };
    }

    Inventory.aggregate([
      {
        $unwind: {
          path: "$openingStocks",
          includeArrayIndex: "index",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $set: {
          "openingStocks.accountId": "$_id",
          "openingStocks.accountName": "$name",
        },
      },
      { $replaceRoot: { newRoot: "$openingStocks" } },
      { $match: conditions },
    ])
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
