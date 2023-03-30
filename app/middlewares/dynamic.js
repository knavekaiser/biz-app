const { dbHelper } = require("../helpers");
const {
  appConfig: { responseFn, responseStr },
} = require("../config");

exports.getModel = async (req, res, next) => {
  try {
    if (req.authToken.userType === "staff") {
      const dynamicTables = req.permissions
        .filter(
          (item) =>
            item.startsWith(req.business._id.toString()) &&
            item.endsWith("_read")
        )
        .map((item) =>
          item
            .replace("_read", "")
            .replace("_create", "")
            .replace("_update", "")
            .replace("_delete", "")
            .replace(`${req.business._id}_`, "")
        );
      if (!dynamicTables.includes(req.params.table)) {
        return responseFn.error(res, {}, responseStr.forbidden, 403);
      }
    }
    const { Model, collection } = await dbHelper.getModel(
      (req.authToken.userType === "admin"
        ? req.query.business
        : req.business?._id || req.authUser._id) +
        "_" +
        req.params.table
    );
    if (!Model || !collection) {
      return responseFn.error(
        res,
        {},
        responseStr.record_not_found.replace(
          "Record",
          `${req.params.table} collection`
        )
      );
    }
    req.Model = Model;
    req.collection = collection;
    next();
  } catch (err) {
    responseFn.error(res, {}, err.message, 500);
  }
};
