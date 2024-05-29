import yup from "yup";

export const create = yup.object({
  body: yup.object({
    category: yup.string().required(),
    name: yup.string().required(),
  }),
});
export const update = yup.object({
  body: yup.object({
    category: yup.string().required(),
    name: yup.string().required(),
  }),
});
