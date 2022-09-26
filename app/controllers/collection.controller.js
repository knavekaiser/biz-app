const {
  appConfig: { responseFn, responseStr },
} = require("../config");

const { Collection, Config } = require("../models");

exports.findAll = async (req, res) => {
  try {
    const id = req.params.id;
    const conditions = { user: req.authUser._id };
    if (id) {
      if (mongoose.isValidObjectId(id)) {
        conditions._id = id;
      } else {
        conditions.name = id;
      }
    }
    Collection.find(conditions)
      .then((data) => {
        if (id) {
          if (data.length) {
            responseFn.success(res, { data: data[0] });
          } else {
            responseFn.error(res, responseStr.record_not_found);
          }
          return;
        }
        responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    new Collection({
      ...req.body,
      user: req.authUser._id,
    })
      .save()
      .then(async (data) => {
        return responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    delete req.body.name;
    Collection.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
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
    Collection.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
