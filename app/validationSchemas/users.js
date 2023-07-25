const yup = require("yup");
const commonYup = require("./commonYup");
const { User, SubPlan } = require("../models");

const updateUser = {
  name: yup.string().min(3),
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
  terms: yup.array().of(yup.string().typeError("Only strings can be a term")),
  chatbots: yup.string().none(),
  subscription: yup.string().none(),
  subPlan: yup
    .string()
    .objectId()
    .test("checkPhone", "Subscription Plan not found", (v) =>
      v ? SubPlan.findOne({ _id: v }) : true
    ),
  password: commonYup.password,
  oldPassword: commonYup.password.when("password", (password, schema) => {
    if (password) {
      return schema.required("oldPassword is required when changing password");
    } else {
      return schema;
    }
  }),
  chatbotDomain: yup
    .string()
    .max(75)
    .test("domain", "Domain already in use", async function (v) {
      if (!v) {
        return true;
      }
      return await User.aggregate([
        {
          $match: {
            _id: {
              $ne: ObjectId(
                this.options.context.req.params._id ||
                  this.options.context.req.authUser._id
              ),
            },
            "chatbots.domain": v,
          },
        },
      ]).then(([chatbot]) => !chatbot);
    }),
};

module.exports = {
  signup: yup.object({
    body: yup.object({
      name: yup.string().required(),
      phone: yup
        .string()
        .min(8)
        .test("checkPhone", "Phone number already in use", (v) =>
          !v ? true : User.findOne({ phone: v }).then((user) => !user)
        ),
      email: yup
        .string()
        .email()
        .test("checkEmail", "Email already in use", (v) =>
          !v ? true : User.findOne({ email: v }).then((user) => !user)
        ),
      password: commonYup.password.required(),
      subscription: yup.string().none(),
      subPlan: yup.string().none(),
      chatbots: yup.string().none(),
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
      chatbots: yup.string().none(),
    }),
  }),

  login: yup.object({
    body: yup.object({
      phone: yup.string(),
      email: yup.string().email(),
      password: yup.string().required(),
    }),
  }),

  forgotPassword: yup.object({
    body: yup.object({
      phone: yup
        .string()
        .test(
          "checkPhone",
          "Account not found",
          (v) => !v || User.findOne({ phone: v })
        ),
      email: yup
        .string()
        .email()
        .test(
          "checkEmail",
          "Account not found",
          (v) => !v || User.findOne({ email: v })
        ),
    }),
  }),

  resetPassword: yup.object({
    body: yup.object({
      phone: yup
        .string()
        .test(
          "checkPhone",
          "Account not found",
          (v) => !v || User.findOne({ phone: v })
        ),
      email: yup
        .string()
        .email()
        .test(
          "checkEmail",
          "Account not found",
          (v) => !v || User.findOne({ email: v })
        ),
      code: yup
        .string()
        .when("phone", (phone, schema) => (phone ? schema.required() : schema)),
      token: yup
        .string()
        .when("email", (email, schema) => (email ? schema.required() : schema)),
      password: commonYup.password.required(),
    }),
  }),

  validatePassToken: yup.object({
    body: yup.object({
      token: yup.string().required(),
    }),
  }),

  updateProfile: yup.object({
    body: yup.object({
      phone: yup.string().when("$req", (req, field) => {
        return field.test(
          "checkPhone",
          "Phone number is already in use",
          (v) =>
            !v ||
            User.findOne({ phone: v, _id: { $ne: req.authUser._id } }).then(
              (user) => !user
            )
        );
      }),
      email: yup
        .string()
        .email()
        .when("$req", (req, field) => {
          return field.test(
            "checkEmail",
            "Email is already in use",
            (v) =>
              !v ||
              User.findOne({ email: v, _id: { $ne: req.authUser._id } }).then(
                (user) => !user
              )
          );
        }),
      ...updateUser,
    }),
  }),

  updateBusiness: yup.object({
    body: yup.object({
      phone: yup.string().when("$req", (req, field) => {
        return field.test(
          "checkPhone",
          "Phone number is already in use",
          (v) =>
            !v ||
            User.findOne({ phone: v, _id: { $ne: req.params._id } }).then(
              (user) => !user
            )
        );
      }),
      email: yup
        .string()
        .email()
        .when("$req", (req, field) => {
          return field.test(
            "checkEmail",
            "Email is already in use",
            (v) =>
              !v ||
              User.findOne({ email: v, _id: { $ne: req.params._id } }).then(
                (user) => !user
              )
          );
        }),
      ...updateUser,
    }),
  }),
};
