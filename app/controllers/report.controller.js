const {
  appConfig: { responseFn, responseStr },
} = require("../config");

const { Chat } = require("../models");

exports.getAnalytics = async (req, res) => {
  try {
    const condition = {};
    if (req.business) {
      condition.user = req.business._id;
    }
    if (req.authToken.user_type === "business") {
      condition.user = req.authUser._id;
    }
    const fromDate = new Date().deduct("0 0 0 28");
    const toDate = new Date();
    Promise.all([
      Chat.aggregate([
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $match: {
            createdAt: {
              $gte: fromDate,
              $lte: toDate,
            },
          },
        },
        {
          $addFields: {
            date: {
              $concat: [
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
        // {
        //   $group: {
        //     _id: "$date",
        //     totalChats: {
        //       $sum: 1,
        //     },
        //   },
        // },
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
            ],
          },
        },
      ]),
    ])
      .then(([[{ chatsOverTime, chatsByTopic }]]) => {
        const labels = [];
        while (fromDate <= toDate) {
          labels.push(
            `${new Date(fromDate).getDate()}-${
              new Date(fromDate).getMonth() + 1
            }-${new Date(fromDate).getFullYear()}`
          );
          fromDate.setDate(fromDate.getDate() + 1);
        }
        chatsOverTime = chatsOverTime.reduce((p, c) => {
          p[c._id] = c.totalChats;
          return p;
        }, {});

        const topicLabels = chatsByTopic.map((item) => item._id);
        chatsByTopic = chatsByTopic.map((item) => item.totalChats);

        responseFn.success(res, {
          data: {
            chatsOverTime: {
              labels,
              data: labels.map((date) => chatsOverTime[date] || 0),
            },
            chatsByTopic: {
              labels: topicLabels,
              data: chatsByTopic,
            },
          },
        });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
