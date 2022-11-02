import { useCallback } from "react";
import useFetch from "./useFetch";
import * as yup from "yup";
const { phone } = require("phone");

export const useYup = (validationSchema) =>
  useCallback(
    async (data) => {
      try {
        const values = await validationSchema.validate(data, {
          abortEarly: false,
        });

        return {
          values,
          errors: {},
        };
      } catch (errors) {
        return {
          values: {},
          errors: errors.inner.reduce(
            (allErrors, currentError) => ({
              ...allErrors,
              [currentError.path]: {
                type: currentError.type ?? "validation",
                message: currentError.message,
              },
            }),
            {}
          ),
        };
      }
    },
    [validationSchema]
  );

yup.addMethod(yup.string, "noneOf", function (arr, message) {
  return this.test("noneOf", message, function (value) {
    const { path, createError } = this;
    return (
      !arr.includes(value) ||
      createError({
        path,
        message: message?.replace(`{value}`, value) || message,
      })
    );
  });
});
yup.addMethod(yup.string, "phone", function (
  message = "Phone number is invalid. Make sure to include country code"
) {
  return this.test("phone", message, function (value) {
    const { path, createError } = this;
    return (
      !value ||
      phone(value)?.isValid ||
      createError({
        path,
        message,
      })
    );
  });
});

export { useFetch };
