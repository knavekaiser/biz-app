import yup from "yup";

export const create = yup.object({
  body: yup.object({
    dateTime: yup.string().required(),
    type: yup.string().required(),
    amount: yup.number().min(0).required(),
    purchases: yup
      .array()
      .of(
        yup.object().shape({
          no: yup.string().required(),
          amount: yup.number().min(0).required(),
        })
      )
      .required()
      .typeError("items must be an array"),
    vendor: yup.object().shape({
      name: yup.string().required(),
      detail: yup.string().required(),
    }),
  }),
});
export const update = yup.object({
  body: yup.object({
    dateTime: yup.string().required(),
    type: yup.string().required(),
    amount: yup.number().min(0).required(),
    purchases: yup
      .array()
      .of(
        yup.object().shape({
          no: yup.string().required(),
          amount: yup.number().min(0).required(),
        })
      )
      .required(),
    vendor: yup.object().shape({
      name: yup.string().required(),
      detail: yup.string().required(),
    }),
  }),
});
