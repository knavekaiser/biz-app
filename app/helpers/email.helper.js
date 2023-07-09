const { appConfig } = require("../config");
const nodemailer = require("nodemailer");

const templates = [
  {
    name: "password_reset",
    subject: "Comify Password Reset Link",
    body: `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Password Reset Request</title>
    </head>
    <body>
        <h2>Password Reset Request</h2>
        <p>Dear {USER_NAME},</p>
        <p>We have received a request to reset the password associated with your Comify Chat account. To proceed with the password reset process, please click on the following link:</p>
        <p><a href="{URL}">Reset Password</a></p>
        <p>Please note that this link will expire after {EXP}, so we recommend resetting your password as soon as possible.</p>
        <p>If you did not request a password reset, please ignore this email. Rest assured, your account remains secure.</p>
        <p>If you have any questions or require further assistance, please don't hesitate to reach out to our support team at <a href="mailto:support@comify.in">support@comify.in</a>. We're here to help.</p>
        <p>Thank you for choosing Comify Chat.</p>
        <p>Best regards,<br>Comify Chat Support Team</p>
    </body>
    </html>`,
  },
];

const emailConfig = {
  host: process.env.EMAIL_SERVER,
  port: process.env.EMAIL_PORT,
  // secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
};
exports.sendEmail = async ({ to, templateName, values }) => {
  let transporter = nodemailer.createTransport(emailConfig);

  const template = templates.find((item) => item.name === templateName);
  Object.entries(values).forEach(([key, value]) => {
    template.body = template.body.replace(key, value);
  });

  const response = await transporter
    .sendMail({
      to,
      subject: template.subject,
      html: template.body,
      from: {
        name: appConfig.appName,
        address: "support@comify.in",
      },
    })
    .catch((err) => ({
      success: false,
      message: err.message,
    }));

  response.success = !!response?.accepted?.length;
  return response;
};
