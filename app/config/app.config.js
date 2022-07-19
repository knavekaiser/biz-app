module.exports = {
  appName: "BIZ APP",

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
    otp_sent: "Otp has been sent successfully.",
    otp_not_found: "Please resend OTP",
    wrong_otp:
      "Incorrect Code. Please enter the correct code. {NUM} attempts left",
    too_many_attempts_to_reset_password:
      "Too many attempts to reset password. Please send the OTP again.",
    otp_sent_already: "OTP has been sent. Please try again after few minutes.",
    password_reset_successful: "Password reset successful. Please Log in",
    otp_sms_failed: "Something went wrong. Please try again later.",
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

  otpTimeout: 120, //in seconds
  passwordResetOtpAttepts: 5,
  supportedImageSizes: 5, // 5MB
  supportedImageTypes: /jpeg|jpg|png|svg/,
  supportedFileSizes: 10, // 10MB
  supportedFileTypes: /jpeg|jpg|png|svg|pdf/,
};
