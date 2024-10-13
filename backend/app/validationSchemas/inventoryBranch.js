import yup from "yup";
import { getModel } from "../models/index.js";

export const create = yup.object({
  body: yup.object({
    name: yup
      .string()
      .test(
        "checkName",
        "Account with the same name already exists.",
        function (v) {
          const req = this.options.context.req;
          const company = req.business?._id || req.authUser._id;
          const InventoryBranch = getModel({
            companyId: company,
            finPeriodId: req.finPeriod._id,
            name: "InventoryBranch",
          });
          return InventoryBranch.findOne({
            company,
            name: v,
          }).then((data) => !data);
        }
      )
      .required(),
  }),
});

export const update = yup.object({
  body: yup.object({
    name: yup
      .string()
      .test(
        "checkName",
        "Account with the same name already exists.",
        function (v) {
          const req = this.options.context.req;
          const company = req.business?._id || req.authUser._id;
          const InventoryBranch = getModel({
            companyId: company,
            finPeriodId: req.finPeriod._id,
            name: "InventoryBranch",
          });
          return InventoryBranch.findOne({
            _id: { $ne: req.params.id },
            company,
            name: v,
          }).then((data) => !data);
        }
      )
      .required(),
  }),
});
