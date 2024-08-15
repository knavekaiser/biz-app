import yup from "yup";

export const create = yup.object({
  body: yup.object({
    start: yup.date().required(),
    end: yup.date().required(),
    category: yup.string().required(),
    business: yup.mixed().required(),
  }),
});
export const update = yup.object({
  body: yup.object({
    start: yup.date().required(),
    end: yup.date().required(),
    category: yup.string().required(),
    business: yup.mixed().required(),
  }),
});
