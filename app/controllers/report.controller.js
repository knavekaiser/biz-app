const {
  appConfig: { responseFn, responseStr },
} = require("../config");

const { Chat } = require("../models");

exports.getAnalytics = async (req, res) => {
  try {
    const { granularity, minDate, maxDate } = req.query;
    const condition = {};
    if (req.business) {
      condition.business = req.business._id;
    }
    if (req.authToken.userType === "business") {
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
