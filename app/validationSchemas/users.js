const yup = require("yup");
const commonYup = require("./commonYup");
const { User, SubPlan } = require("../models");

module.exports = {
  signup: yup.object({
    body: yup.object({
      name: yup.string().required(),
      phone: yup
        .string()
        .min(8)
        .required()
        .test("checkPhone", "Phone number already in use", (v) =>
          User.findOne({ phone: v }).then((user) => !user)
        ),
      password: commonYup.password.required(),
      subscription: yup.string().none(),
      subPlan: yup.string().none(),
    }),
  }),

  createBusiness: yup.object({
    body: yup.object({
      name: yup.string().required(),
      phone: yup
        .string()
        .min(8)
        .required()
        .test("checkPhone", "Phone number already in use", (v) =>
          User.findOne({ phone: v }).then((user) => !user)
        ),
      password: commonYup.password.required(),
      subscription: yup.string().none(),
      subPlan: yup
        .string()
        .objectId()
        .test("checkPhone", "Subscription Plan not found", (v) =>
          SubPlan.findOne({ _id: v })
        )
        .required(),
    }),
  }),

  login: yup.object({
    body: yup.object({
      phone: yup.string().required(),
      password: yup.string().required(),
    }),
  }),

  forgotPassword: yup.object({
    body: yup.object({
      phone: yup
        .string()
        .required()
        .test("checkPhone", "Account not found", (v) =>
          User.findOne({ phone: v })
        ),
    }),
  }),

  resetPassword: yup.object({
    body: yup.object({
      phone: yup
        .string()
        .required()
        .test("checkPhone", "Account not found", (v) =>
          User.findOne({ phone: v })
        ),
      code: yup.string().required(),
      password: commonYup.password.required(),
    }),
  }),

  update: yup.object({
    body: yup.object({
      name: yup.string().min(3),
      phone: yup.string(),
      // .test("checkPhone", "Phone number already in use", (v) =>
      //   User.findOne({ phone: v }).then((user) => !user)
      // ),
      password: commonYup.password,
      bankDetails: yup.object({
        bankName: yup.string(),
        branch: yup.string(),
        accNo: yup.string(),
        accName: yup.string(),
      }),
      ownerDetails: yup.object({
        name: yup.string(),
        phone: yup.string(),
        email: yup.string(),
        signature: yup.string(),
      }),
      address: yup.object(),
      terms: yup
        .array()
        .of(yup.string().typeError("Only strings can be a term")),
      subscription: yup.string().none(),
      subPlan: yup
        .string()
        .objectId()
        .test("checkPhone", "Subscription Plan not found", (v) =>
          SubPlan.findOne({ _id: v })
        ),
    }),
  }),
};
