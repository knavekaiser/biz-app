import { appConfig } from "../config/index.js";
import { dbHelper } from "../helpers/index.js";
import { Chat, Module, Report, Submodule } from "../models/index.js";
import { ObjectId } from "mongodb";

const { responseFn, responseStr } = appConfig;

export const getAnalytics = async (req, res) => {
  try {
    const { granularity, minDate, maxDate } = req.query;
    const condition = {};
    if (req.business) {
      condition.business = req.business._id;
    }
    if (req.authToken.userType === "company") {
      condition.business = req.authUser._id;
    }
    const fromDate = minDate
      ? new Date(minDate)
      : new Date().deduct("0 0 0 28");
    const toDate = maxDate ? new Date(maxDate) : new Date();
    condition.createdAt = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    };
    Promise.all([
      Chat.aggregate([
        {
          $sort: {
            createdAt: -1,
          },
        },
        { $match: condition },
        {
          $addFields: {
            date: {
              $concat:
                granularity === "month"
                  ? [
                      {
                        $toString: {
                          $month: "$createdAt",
                        },
                      },
                      "-",
                      {
                        $toString: {
                          $year: "$createdAt",
                        },
                      },
                    ]
                  : [
                      {
                        $toString: {
                          $dayOfMonth: "$createdAt",
                        },
                      },
                      "-",
                      {
                        $toString: {
                          $month: "$createdAt",
                        },
                      },
                      "-",
                      {
                        $toString: {
                          $year: "$createdAt",
                        },
                      },
                    ],
            },
          },
        },
        {
          $facet: {
            chatsOverTime: [
              {
                $group: {
                  _id: "$date",
                  totalChats: {
                    $sum: 1,
                  },
                },
              },
            ],
            chatsByTopic: [
              {
                $group: {
                  _id: "$topic",
                  totalChats: {
                    $sum: 1,
                  },
                },
              },
              {
                $sort: {
                  totalChats: 1,
                  _id: 1,
                },
              },
            ],
            tokenUsageOverTime: [
              {
                $group: {
                  _id: "$date",
                  totalUsage: {
                    $sum: {
                      $reduce: {
                        input: "$messages",
                        initialValue: 0,
                        in: {
                          $add: [
                            "$$value",
                            {
                              $cond: [
                                {
                                  $and: [
                                    {
                                      $ifNull: ["$$this.token", false],
                                    },
                                    {
                                      $ne: ["$$this.token", null],
                                    },
                                  ],
                                },
                                "$$this.token",
                                0,
                              ],
                            },
                          ],
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      ]),
    ])
      .then(([[{ chatsOverTime, chatsByTopic, tokenUsageOverTime }]]) => {
        const labels = [];
        while (fromDate <= toDate) {
          if (granularity === "month") {
            labels.push(
              `${new Date(fromDate).getMonth() + 1}-${new Date(
                fromDate
              ).getFullYear()}`
            );
            fromDate.setMonth(fromDate.getMonth() + 1);
          } else {
            labels.push(
              `${new Date(fromDate).getDate()}-${
                new Date(fromDate).getMonth() + 1
              }-${new Date(fromDate).getFullYear()}`
            );
            fromDate.setDate(fromDate.getDate() + 1);
          }
        }
        chatsOverTime = chatsOverTime.reduce((p, c) => {
          p[c._id] = c.totalChats;
          return p;
        }, {});
        tokenUsageOverTime = tokenUsageOverTime.reduce((p, c) => {
          p[c._id] = c.totalUsage;
          return p;
        }, {});

        responseFn.success(res, {
          data: {
            chatsOverTime: {
              labels,
              data: labels.map((date) => chatsOverTime[date] || 0),
            },
            chatsByTopic: {
              labels: chatsByTopic.map((item) => item._id),
              data: chatsByTopic.map((item) => item.totalChats),
            },
            tokenUsageOverTime: {
              labels,
              data: labels.map((date) => tokenUsageOverTime[date] || 0),
            },
          },
        });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const genPipeline = async (req, res) => {
  try {
    const companyId = req.company?._id || req.authUser._id;
    const baseTable = req.body.table;
    const columns = req.body.columns;

    const pipeline = [];

    columns
      .filter((col) => col.type === "module-coll-lookup")
      .forEach((col) => {
        let tableName = `${companyId}_${col.table.module}_${col.table.name}`;
        pipeline.push(
          ...[
            {
              $lookup: {
                // type: "module-coll-lookup",
                from: tableName,
                localField: col.localField,
                foreignField: col.foreignField,
                as: col.field,
              },
            },
          ]
        );
      });
    columns
      .filter((col) => col.type === "submodule-lookup")
      .forEach((col) => {
        let tableName = `${companyId}_${col.table.module}_${col.table.name}`;
        pipeline.push(
          ...[
            {
              $lookup: {
                // type: "submodule-lookup",
                from: tableName,
                localField: col.localField,
                foreignField: col.foreignField,
                as: col.label,
              },
            },
            {
              $unwind: {
                path: `$${col.label}`,
                preserveNullAndEmptyArrays: true,
              },
            },
          ]
        );
      });
    const submoduleColumn = columns.find(
      (col) => col.type === "submodule-lookup" && col.foreignField === "record"
    );
    columns
      .filter((col) => col.type === "submodule-coll-lookup")
      .forEach((col) => {
        let tableName = `${companyId}_${col.table.module}_${col.table.submodule}_${col.table.name}`;
        pipeline.push(
          ...[
            {
              $lookup: {
                // type: "submodule-coll-lookup",
                from: tableName,
                localField: `${submoduleColumn?.label}.${col.table.name}`,
                foreignField: "_id",
                as: `${submoduleColumn?.label}.${col.localField}`,
              },
            },
            {
              $set: {
                [`${submoduleColumn?.label}.${col.localField}`]: {
                  $getField: {
                    input: {
                      $first: `$${submoduleColumn?.label}.${col.localField}`,
                    },
                    field: "name",
                  },
                },
              },
            },
          ]
        );
      });

    if (
      columns.some(
        (col) => col.field === "assignedTo" && col.type === "localField"
      )
    ) {
      pipeline.push(
        ...[
          {
            $lookup: {
              from: "staffs",
              localField: "assignedTo",
              foreignField: "_id",
              as: "assignedStaff",
            },
          },
          {
            $lookup: {
              from: "companies",
              localField: "assignedTo",
              foreignField: "_id",
              as: "assignedCompany",
            },
          },
          {
            $set: {
              assignedTo: {
                $getField: {
                  input: {
                    $ifNull: [
                      { $first: "$assignedCompany" },
                      { $first: "$assignedStaff" },
                    ],
                  },
                  field: "name",
                },
              },
            },
          },
        ]
      );
    }

    const project = {};
    columns.forEach((col) => {
      if (col.type === "module-coll-lookup") {
        project[col.label] = {
          $getField: {
            field: "name",
            input: { $first: `$${col.field}` },
          },
        };
      } else if (col.type === "submodule-lookup") {
        project[col.label] = {
          $getField: {
            field: col.table.field,
            input: `$${col.label}`,
          },
        };
      } else if (col.type === "submodule-coll-lookup") {
        project[col.label] = {
          $getField: {
            field: col.table.name,
            input: `$${submoduleColumn.label}`,
          },
        };
      } else if (col.type === "localField" && col.field === "assignedTo") {
        project[col.label] = `$${col.field}`;
      } else {
        project[col.label] = `$${col.field}`;
      }
    });
    pipeline.push({ $project: project });

    return responseFn.success(res, { data: pipeline });
  } catch (err) {
    return responseFn.error(res, {}, err.message, 500);
  }
};

const getModelForReport = async ({ companyId, table }) => {
  let tableName = `${companyId}_${table.name}`;
  if (["module-coll", "submodule-coll"].includes(table.type)) {
    tableName = `${companyId}_${table.module || table.submodule}_${table.name}`;
  }

  let Model = null;
  if (table.type === "collection") {
    Model = await dbHelper.getModel(tableName).then((data) => data.Model);
  } else if (["module", "submodule"].includes(table.type)) {
    const module = await (table.type === "module" ? Module : Submodule).findOne(
      { name: table.name }
    );
    Model = await dbHelper
      .getModuleModel({
        name: `${companyId}_${module.name}`,
        fields: module.fields,
      })
      .then((data) => data.Model);
  } else if (["module-coll", "submodule-coll"].includes(table.type)) {
    const module = await (table.type === "module" ? Module : Submodule).findOne(
      { name: table.name }
    );
    Model = await dbHelper
      .getModuleModel({
        name: `${companyId}_${module.name}_${table.name}`,
        fields: module.fields.find((f) => f.name === table.name)?.fields,
      })
      .then((data) => data.Model);
  }
  return Model;
};
export const testPipeline = async (req, res) => {
  try {
    const companyId = req.company?._id || req.authUser._id;
    const Model = await getModelForReport({ companyId, table: req.body.table });

    const data = await Model.aggregate(req.body.pipeline);
    return responseFn.success(res, { data });
  } catch (err) {
    return responseFn.error(res, {}, err.message, 500);
  }
};

export const genReport = async (req, res) => {
  try {
    const reportTemplate = await Report.findOne({ _id: req.params._id });
    const companyId = reportTemplate.company;
    const table = reportTemplate.tables.find((t) => t.type === "module");

    const match = {};
    if (req.query.startDate && req.query.endDate) {
      match.createdAt = {
        $gte: new Date(req.query.startDate),
        $lt: new Date(req.query.endDate).add("0 0 0 1"),
      };
    }

    const Model = await getModelForReport({ companyId, table });
    const data = await Model.aggregate([
      { $match: match },
      ...reportTemplate.pipeline,
    ]);

    return responseFn.success(res, {
      data: {
        name: reportTemplate.name,
        columns: reportTemplate.columns,
        records: data,
      },
    });
  } catch (err) {
    return responseFn.error(res, {}, err.message, 500);
  }
};

export const getReports = async (req, res) => {
  try {
    const conditions = {
      company: ObjectId(req.business?._id || req.authUser._id),
    };
    if (req.params._id) {
      conditions._id = req.params._id;
    }
    Report.find(conditions)
      .then((data) => {
        if (req.params._id) {
          if (data.length) {
            responseFn.success(res, { data: data[0] });
          } else {
            responseFn.success(res, {}, responseStr.record_not_found);
          }
          return;
        }
        responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (err) {
    return responseFn.error(res, {}, err.message, 500);
  }
};

export const createReport = async (req, res) => {
  try {
    new Report({ ...req.body, company: req.business?._id || req.authUser._id })
      .save()
      .then((data) => {
        return responseFn.success(res, { data }, responseStr.record_updated);
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (err) {
    return responseFn.error(res, {}, err.message, 500);
  }
};

export const updateReport = async (req, res) => {
  try {
    Report.findOneAndUpdate(
      { _id: req.params._id, company: req.business?._id || req.authUser._id },
      req.body,
      { new: true }
    )
      .then((data) => {
        return responseFn.success(res, { data }, responseStr.record_updated);
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (err) {
    return responseFn.error(res, {}, err.message, 500);
  }
};

export const deleteReport = async (req, res) => {
  try {
    Report.deleteMany({
      _id: req.params._id,
      company: req.business?._id || req.authUser._id,
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (err) {
    return responseFn.error(res, {}, err.message, 500);
  }
};
