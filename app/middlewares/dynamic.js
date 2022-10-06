const { dbHelper } = require("../helpers");
const {
  appConfig: { responseFn, responseStr },
} = require("../config");

exports.getModel = async (req, res, next) => {
  try {
    const { Model, collection } = await dbHelper.getModel(
      req.authUser._id + "_" + req.params.table
    );
    if (!Model || !collection) {
      return responseFn.error(
        res,
        {},
        responseStr.record_not_found.replace("Record", "Collection")
      );
    }
    if (!Model || !collection) {
      return responseFn.error(
        res,
        {},
        responseStr.record_not_found.replace("Collection")
      );
    }
    req.Model = Model;
    req.collection = collection;
    next();
  } catch (err) {
    responseFn.error(res, {}, err.message, 500);
  }
};
