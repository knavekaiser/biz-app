import yup from "yup";
import { Account, Journal } from "../models/index.js";

const accountId = yup
  .string()
  .test("checkAccount", "Account does not exist.", async function (v) {
    const account = await Account.findOne({
      _id: v,
      isGroup: false,
    });
    if (account) {
      const index = this.options.context.req.body.accountingEntries?.findIndex(
        (item) => item.accountId === v
      );
      this.options.context.req.body.accountingEntries[index].accountName =
        account.name;
      return true;
    }
    return false;
  })
  .required();

export const create = yup.object({
  body: yup.object({
    dateTime: yup.string().required(),
    detail: yup.string().nullable(),
    accountingEntries: yup
      .array()
      .of(
        yup.object({
          accountId,
          debit: yup.number().min(0).required(),
          credit: yup.number().min(0).required(),
        })
      )
      .min(1)
      .required(),
  }),
});
export const update = yup.object({
  params: yup.object({
    _id: yup
      .string()
      .test("checkEntry", "Entry does not exist.", (v) =>
        Journal.findOne({ _id: v })
      ),
  }),
  body: yup.object({
    dateTime: yup.string().required(),
    detail: yup.string().nullable(),
    accountingEntries: yup
      .array()
      .of(
        yup.object({
          accountId,
          debit: yup.number().min(0).required(),
          credit: yup.number().min(0).required(),
        })
      )
      .min(1)
      .required(),
  }),
});
