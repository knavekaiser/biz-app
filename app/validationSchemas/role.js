import yup from "yup";

export const create = yup.object({
  body: yup.object({
    name: yup.string().required(),
    permissions: yup
      .array()
      .of(yup.string().required())
      .required()
      .typeError("items must be an array"),
  }),
});
export const update = yup.object({
  body: yup.object({
    name: yup.string().required(),
    permissions: yup
      .array()
      .of(yup.string().required())
      .required()
      .typeError("items must be an array"),
  }),
});
