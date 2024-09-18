import yup from "yup";

export const create = yup.object({
  body: yup.object({
    name: yup.string().required(),
    parent: yup.string().nullable(),
    type: yup
      .string()
      .oneOf(["Asset", "Liability", "Income", "Expense"])
      .required(),
    isGroup: yup.boolean().required(),
    openingBalance: yup.number().required(),
  }),
});
export const update = yup.object({
  body: yup.object({
    name: yup.string().required(),
    parent: yup.string().nullable(),
    type: yup
      .string()
      .oneOf(["Asset", "Liability", "Income", "Expense"])
      .required(),
    isGroup: yup.boolean().required(),
    openingBalance: yup.number().required(),
  }),
});
