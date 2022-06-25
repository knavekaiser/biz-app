module.exports = {
  appName: "Infin AI",

  responseFn: {
    success: (res, data, message = "Success") => {
      return res.status(200).send({
        success: true,
        ...data,
        message,
      });
    },
    error: (
      res,
      errors = {},
      message = "Some error occurred. Please try again later.",
      statusCode = 200
    ) => {
      return res.status(statusCode).send({
        success: false,
        message,
        errors,
      });
    },
  },
  responseStr: {
    login_successful: "Login successful",
    invalid_cred: "Invalid credentials",
    register_successful: "Registeration successful. Please Log in",
    email_doesnt_exists: "Email doesn't exists",

    record_created: "Record created successfully",
    record_updated: "Record updated successfully",
    record_not_found: "Record not found",
    record_deleted: "Record has been deleted successfully",
    records_deleted: "{num} records has been deleted successfully",

    file_too_large:
      "File is too large. Please provide files that are less that {maxSize}",

    success: "Success",
    unauthorized: "Unauthorized",
    forbidden: "Forbidden",
  },

  supportedImageSizes: 5, // 5MB
  supportedImageTypes: /jpeg|jpg|png|svg/,
  supportedFileSizes: 10, // 10MB
  supportedFileTypes: /jpeg|jpg|png|svg|pdf/,
};
