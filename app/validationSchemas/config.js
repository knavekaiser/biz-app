const yup = require("yup");
const commonYup = require("./commonYup");

module.exports = {
  update: yup.object({
    body: yup.object({
      print: yup.object().shape({
        currency: yup.string(),
        itemColumns: yup
          .array()
          .of(yup.string().typeError("Please provide strings only")),
      }),
      unitsOfMeasure: yup
        .array()
        .of(yup.string().typeError("Only strings can be a unit of measurement"))
        .min(1),
      nextInvoiceNo: yup.number().min(1).required(),
    }),
  }),
};
