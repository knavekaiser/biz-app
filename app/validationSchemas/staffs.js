import yup from "yup";
import * as commonYup from "./commonYup.js";
import { User } from "../models/index.js";

export const signup = yup.object({
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
  }),
});

export const login = yup.object({
  body: yup.object({
    phone: yup.string().required(),
    password: yup.string().required(),
  }),
});

export const forgotPassword = yup.object({
  body: yup.object({
    phone: yup
      .string()
      .required()
      .test("checkPhone", "Account not found", (v) =>
        User.findOne({ phone: v })
      ),
  }),
});

export const resetPassword = yup.object({
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
});

export const update = yup.object({
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
    address: yup.string(),
    terms: yup.array().of(yup.string().typeError("Only strings can be a term")),
  }),
});
