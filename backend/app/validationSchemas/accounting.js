import yup from "yup";
import { Account } from "../models/index.js";

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
          return Account.findOne({
            company,
            name: v,
          }).then((data) => !data);
        }
      )
      .required(),
    parent: yup.string().nullable(),
    type: yup
      .string()
      .oneOf([
        "Cash",
        "Bank",
        "Customers",
        "Suppliers",
        "Sales",
        "Purchase",
        "Stock",
        "Tax",
        null,
      ])
      .nullable(),
    isGroup: yup.boolean().required(),
    openingBalance: yup.number().required(),
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
          return Account.findOne({
            _id: { $ne: req.params.id },
            company,
            name: v,
          }).then((data) => !data);
        }
      )
      .required(),
    parent: yup.string().nullable(),
    type: yup
      .string()
      .oneOf([
        "Cash",
        "Bank",
        "Customers",
        "Suppliers",
        "Sales",
        "Purchase",
        "Stock",
        "Tax",
        null,
      ])
      .nullable(),
    isGroup: yup.boolean().required(),
    openingBalance: yup.number().required(),
  }),
});
