import { appConfig } from "../config/index.js";
import { Chat, Report } from "../models/index.js";
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

export const genReport = async (req, res) => {
  try {
    const reportTemplate = await Report.findOne({ _id: req.params._id });
    return responseFn.success(res, {
      data: {
        name: reportTemplate.name,
        columns: reportTemplate.pipeline,
        data: [],
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
