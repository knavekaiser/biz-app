import yup from "yup";

const fieldSchema = yup.object().shape({
  name: yup.string().required(),
  dataType: yup.string().required(),
  label: yup.string().required(),
  fieldType: yup.string(),
  inputType: yup.string(),
  required: yup.boolean().required(),
  // options for select and radio
});

export const create = yup.object({
  body: yup.object({
    name: yup.string().required(),
    fields: yup
      .array()
      .of(fieldSchema)
      .min(1)
      .required()
      .typeError("items must be an array"),
  }),
});
export const update = yup.object({
  body: yup.object({
    name: yup.string().required(),
    fields: yup
      .array()
      .of(fieldSchema)
      .min(1)
      .required()
      .typeError("items must be an array"),
  }),
});

export const addSchemaTemplate = yup.object({
  body: yup.object({
    schema_id: yup.string().required(),
  }),
});
