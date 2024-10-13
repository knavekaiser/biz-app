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
          const Inventory = getModel({
            companyId: company,
            finPeriodId: req.finPeriod._id,
            name: "Inventory",
          });
          return Inventory.findOne({
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
    openingStocks: yup
      .array()
      .of(
        yup.object({
          branch: yup.string().required(),
          openingStock: yup.number().required(),
          cost: yup.number().required(),
          reorderQty: yup.number().required(),
        })
      )
      .when("isGroup", {
        is: false,
        then: (schema) => schema.min(1).required(),
        otherwise: (schema) => schema,
      }),
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
          const Inventory = getModel({
            companyId: company,
            finPeriodId: req.finPeriod._id,
            name: "Inventory",
          });
          return Inventory.findOne({
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
    openingStocks: yup
      .array()
      .of(
        yup.object({
          branch: yup.string().required(),
          openingStock: yup.number().required(),
          cost: yup.number().required(),
          reorderQty: yup.number().required(),
        })
      )
      .when("isGroup", {
        is: false,
        then: (schema) => schema.min(1).required(),
        otherwise: (schema) => schema,
      }),
  }),
});
