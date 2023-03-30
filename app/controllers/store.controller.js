const {
  appConfig: { responseFn, responseStr },
} = require("../config");
const { fileHelper } = require("../helpers");

const { Store } = require("../models");

exports.homeStores = async (req, res) => {
  try {
    const conditions = {};
    if (req.query.category) {
      conditions.category = { $in: req.query.category.split(",") };
    }
    Store.aggregate([
      { $match: conditions },
      {
        $lookup: {
          from: "users",
          as: "business",
          let: { id: "$business" },
          pipeline: [
            { $match: { $expr: { $eq: ["$$id", "$_id"] } } },
            {
              $project: {
                phone: 1,
                email: 1,
                name: 1,
                photo: 1,
                logo: 1,
                domain: 1,
                address: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$business", preserveNullAndEmptyArrays: false } },
    ])
      .then(async (data) => {
        responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.homeCategories = async (req, res) => {
  try {
    Store.aggregate([{ $group: { _id: "$category" } }])
      .then(async (data) => {
        responseFn.success(res, { data: data.map((item) => item._id) });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.find = async (req, res) => {
  try {
    const conditions = {};
    if ("name" in req.query) {
      conditions.name = {
        $regex: req.query.name,
        $options: "i",
      };
    }
    if ("business" in req.query) {
      conditions.business = req.query.business;
    }
    Store.find(conditions, "-__v")
      .populate("business", "name phone email domain logo")
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
    new Store({ ...req.body })
      .save()
      .then(async (data) => {
        const store = await Store.findOne({ _id: data._id }).populate(
          "business",
          "name phone email domain logo"
        );
        return responseFn.success(res, { data: store });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    if (req.body.image) {
      fileHelper.deleteFiles(req.body.image);
    }
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    Store.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
      .then(async (data) => {
        const store = await Store.findOne({ _id: data._id }).populate(
          "business",
          "name phone email domain logo"
        );
        return responseFn.success(
          res,
          { data: store },
          responseStr.record_updated
        );
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
    const stores = await Store.find(
      {
        _id: { $in: [...(req.body.ids || []), req.params.id] },
      },
      "photo"
    );
    stores.forEach(async (store) => {
      if (store.photo) {
        fileHelper.deleteFiles(store.photo);
      }
    });
    Store.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
