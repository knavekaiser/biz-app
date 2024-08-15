import yup from "yup";

export const update = yup.object({
  body: yup.object({
    employee: yup.string().required(),
    roles: yup.array().of(yup.string()).required(),
  }),
});
