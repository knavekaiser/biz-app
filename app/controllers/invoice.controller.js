const {
  appConfig: { responseFn, responseStr },
} = require("../config");
const { ObjectId } = require("mongodb");

const { Invoice, Config } = require("../models");

exports.findAll = async (req, res) => {
  try {
    const conditions = {
      user: ObjectId(req.business?._id || req.authUser._id),
    };
    if (+req.query.no) {
      conditions.no = +req.query.no;
    }
    Invoice.aggregate([
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
                { case: { $gt: ["$paid", "$due"] }, then: "due" },
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

exports.create = async (req, res) => {
  try {
    const { nextInvoiceNo } =
      (await Config.findOne({ user: req.business?._id || req.authUser._id })) ||
      {};

    new Invoice({
      ...req.body,
      user: req.business?._id || req.authUser._id,
      no: nextInvoiceNo || 1,
    })
      .save()
      .then(async (data) => {
        await Config.findOneAndUpdate(
          { user: req.business?._id || req.authUser._id },
          { $inc: { nextInvoiceNo: 1 } },
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
    Invoice.findOneAndUpdate(
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

exports.delete = async (req, res) => {
  try {
    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    Invoice.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
      user: req.business?._id || req.authUser._id,
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
