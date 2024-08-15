import yup from "yup";
import * as commonYup from "./commonYup.js";

export const validateAccount = yup.object({
  body: yup.object({
    phone: yup.string().phone(),
    email: yup.string().email("Email is invalid"),
  }),
});

export const signup = yup.object({
  body: yup.object({
    name: yup.string().required(),
    phone: yup.string().phone(),
    email: yup.string().email("Email is invalid"),
    password: commonYup.password.required(),
  }),
});

export const login = yup.object({
  body: yup.object({
    phone: yup.string().phone(),
    email: yup.string().email(),
    password: yup.string().required(),
  }),
});

export const addReview = yup.object({
  body: yup.object({
    product: yup.string().objectId().required(),
    rating: yup
      .number()
      .min(1, "rating can't be less than 1")
      .max(5, "rating can't be greater than 5")
      .required()
      .typeError("rating must be a number"),
    review: yup.string().max(250, "review must be less than 250 characters"),
  }),
});

export const updateCart = yup.object({
  body: yup.object({
    products: yup.array().of(
      yup.object({
        product: yup.object({
          _id: yup.string().objectId().required(),
          title: yup.string().required(),
        }),
        qty: yup.number().min(1, "Qty can't be less that 1"),
      })
    ),
  }),
});

export const placeOrder = yup.object({
  body: yup.object({
    paymentMethod: yup.string().oneOf(["cod", "prepaid"]).required(),
  }),
});

// ------------------------------------------------ Not applied

export const forgotPassword = yup.object({
  body: yup.object({
    phone: yup.string().required(),
  }),
});

export const resetPassword = yup.object({
  body: yup.object({
    phone: yup.string().required(),
    code: yup.string().required(),
    password: commonYup.password.required(),
  }),
});

export const update = yup.object({
  body: yup.object({
    name: yup.string().min(3),
    phone: yup.string(),
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
