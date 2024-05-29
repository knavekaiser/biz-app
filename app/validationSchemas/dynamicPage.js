import yup from "yup";

export const create = yup.object({
  body: yup.object({
    title: yup.string().required(),
    description: yup.string(),
    path: yup.string().required(),
    thumbnail: yup.mixed(),
    files: yup.array().of(yup.mixed()).typeError("files must be an array"),
  }),
});
export const update = yup.object({
  body: yup.object({
    title: yup.string(),
    description: yup.string(),
    path: yup.string().required(),
    thumbnail: yup.mixed(),
    files: yup.array().of(yup.mixed()).typeError("files must be an array"),
  }),
});
