import yup from "yup";
import { getModel } from "../models/index.js";

export const create = yup.object({
  body: yup.object({
    branch: yup
      .string()
      .test("checkBranch", "Branch does not exist.", function (v) {
        const req = this.options.context.req;
        const InventoryBranch = getModel({
          companyId: (req.business || req.authUser)._id,
          finPeriodId: req.finPeriod._id,
          name: "InventoryBranch",
        });
        return InventoryBranch.findOne({ _id: v });
      })
      .required(),
    dateTime: yup
      .string()
      .test(
        "checkDate",
        "dateTime must be within the financial period.",
        function (v) {
          const req = this.options.context.req;
          return (
            new Date(v) >= new Date(req.finPeriod.startDate) &&
            new Date(v) <= new Date(req.finPeriod.endDate)
          );
        }
      )
      .required(),
    gst: yup.number().min(0).required(),
    items: yup
      .array()
      .of(
        yup.object().shape({
          product: yup
            .object({
              _id: yup.string().required(),
              name: yup.string().required(),
            })
            .required(),
          price: yup.number().min(0).required(),
          qty: yup.number().min(0).required(),
          unit: yup.string().required(),
        })
      )
      .min(1)
      .required()
      .typeError("items must be an array"),
    // vendor: yup.object().shape({
    //   name: yup.string().required(),
    //   detail: yup.string().required(),
    // }),
  }),
});
export const update = yup.object({
  body: yup.object({
    branch: yup
      .string()
      .test("checkBranch", "Branch does not exist.", function (v) {
        const req = this.options.context.req;
        const InventoryBranch = getModel({
          companyId: (req.business || req.authUser)._id,
          finPeriodId: req.finPeriod._id,
          name: "InventoryBranch",
        });
        return InventoryBranch.findOne({ _id: v });
      })
      .required(),
    dateTime: yup
      .string()
      .test(
        "checkDate",
        "dateTime must be within the financial period.",
        function (v) {
          const req = this.options.context.req;
          return (
            new Date(v) >= new Date(req.finPeriod.startDate) &&
            new Date(v) <= new Date(req.finPeriod.endDate)
          );
        }
      )
      .required(),
    gst: yup.number().min(0).required(),
    items: yup
      .array()
      .of(
        yup.object().shape({
          product: yup
            .object({
              _id: yup.string().required(),
              name: yup.string().required(),
            })
            .required(),
          price: yup.number().min(0).required(),
          qty: yup.number().min(0).required(),
          unit: yup.string().required(),
        })
      )
      .min(1)
      .required(),
    // vendor: yup.object().shape({
    //   name: yup.string().required(),
    //   detail: yup.string().required(),
    // }),
  }),
});
