const {
  appConfig: { responseFn, responseStr },
} = require("../config");
const { ObjectId } = require("mongodb");

const { Purchase, Config } = require("../models");

exports.findAll = async (req, res) => {
  try {
    const conditions = { user: ObjectId(req.authUser._id) };
    if (+req.query.no) {
      conditions.no = +req.query.no;
    }
    Purchase.aggregate([
      { $match: conditions },
      {
        $lookup: {
          from: "payments",
          as: "due",
          let: { invNo: "$no" },
          pipeline: [
            {
              $match: {
                user: ObjectId(req.authUser._id),
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

exports.create = async (req, res) => {
  try {
    const { nextPurchaseNo } =
      (await Config.findOne({ user: req.authUser._id })) || {};

    new Purchase({
      ...req.body,
      user: req.authUser._id,
      no: nextPurchaseNo || 1,
    })
      .save()
      .then(async (data) => {
        await Config.findOneAndUpdate(
          { user: req.authUser._id },
          { $inc: { nextPurchaseNo: 1 } },
          { new: true }
        );
        return responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    delete req.body.no;
    Purchase.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
      .then((data) => {
        return responseFn.success(res, { data }, responseStr.record_updated);
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.delete = async (req, res) => {
  try {
    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    Purchase.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
