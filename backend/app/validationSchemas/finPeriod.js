import yup from "yup";

export const create = yup.object({
  body: yup.object({
    label: yup.string().required(),
    startDate: yup.string().required(),
    endDate: yup.string().required(),
  }),
});
export const update = yup.object({
  body: yup.object({
    label: yup.string().required(),
    startDate: yup.string().required(),
    endDate: yup.string().required(),
  }),
});
