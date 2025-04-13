import { responseFn } from "../config/app.config.js";
import * as fileHelper from "../helpers/file.helper.js";
import { cdnHelper } from "../helpers/index.js";

export const validate = (schema) => async (req, res, next) => {
  try {
    const values = await schema.validate(
      {
        body: req.body,
        query: req.query,
        params: req.params,
      },
      { context: { req } }
    );

    // req.body = values.body;
    // req.query = values.query;
    // req.params = values.params;

    return next();
  } catch (err) {
    if (req.files) {
      cdnHelper.deleteFiles(req.files.map((file) => file.key));
    }

    return responseFn.error(
      res,
      {
        type: "field_validation",
        field: err.params?.path,
      },
      err.message,
      400
    );
  }
};
