module.exports = {
  appName: "Comify",

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
      error = {},
      message = "Some error occurred. Please try again later.",
      statusCode = 200
    ) => {
      return res.status(statusCode).send({
        success: false,
        message,
        error,
      });
    },
  },
  responseStr: {
    error_occurred_contact_support:
      "Some error occurred. Please contact support.",
    login_successful: "Login successful",
    invalid_cred: "Invalid credentials",
    register_successful: "Registeration successful. Please Log in",
    otp_sent: "Otp has been sent successfully.",
    otp_not_found: "Please resend OTP",
    token_not_found: "Please resend email",
    token_is_valid: "Provided token is valid.",
    wrong_otp:
      "Incorrect Code. Please enter the correct code. {NUM} attempts left",
    too_many_attempts_to_reset_password:
      "Too many attempts to reset password. Please send the OTP again.",
    otp_sent_already:
      "An OTP has already been sent. If you haven't received it, please try again in a few minutes.",
    email_sent_already:
      "An email has already been sent. If you haven't received it, please check your spam folder. If it's still not there, please try again in a few minutes.",
    password_reset_successful: "Password reset successful. Please Log in",
    otp_sms_failed: "Something went wrong. Please try again later.",
    email_doesnt_exists: "Email doesn't exists",
    include_either_topic_or_url: "Please either include a topic or an URL",

    record_created: "Record created successfully",
    record_updated: "Record updated successfully",
    record_not_found: "Record not found",
    record_deleted: "Record has been deleted successfully",
    record_not_deleted: "Record could not be deleted",
    records_created: "{num} records created successfully",
    records_updated: "{num} record updated successfully",
    records_deleted: "{num} records has been deleted successfully",

    order_placed: "Order has been placed succesfully",

    field_required: "{field} is required",
    fields_required: "{fields} are required",

    domain_not_specified: "Domain not specified",
    max_product_limit_reached:
      "Maximum number product reached. Please upgrade your account to add more products.",
    max_context_token_limit: `Too many tokens in context! Your message has {TOKEN_COUNT} tokens. Please reduce it to {MAX_TOKEN} tokens or less. Upgrade your account for longer context.`,

    file_too_large:
      "File is too large. Please provide files that are less that {maxSize}",
    unsupported_file_type: "Only {fileTypes} are supported",

    success: "Success",
    unauthorized: "Unauthorized",
    forbidden: "Forbidden",
  },

  uploadDir: "/assets/uploads",
  otpTimeout: 120, //in seconds
  passwordResetOtpAttepts: 5,
  supportedImageSizes: 5, // 5MB
  supportedImageTypes:
    /jpeg|jpg|png|webp|svg|ico|css|vnd\.openxmlformats\-officedocument\.wordprocessingml\.document/,
  supportedFileSizes: 10, // 10MB
  supportedFileTypes:
    /jpeg|jpg|png|webp|svg|pdf|ico|css|vnd\.openxmlformats\-officedocument\.wordprocessingml\.document/,
};
