const fetchkk = require("node-fetch");

exports.sendSms = ({ variables_values, to, otp, message }) => {
  const reqBody = {
    route: "dlt",
    sender_id: "DelPay",
    message,
    variables_values,
    flash: 0,
    numbers: to.join(),
  };
  return fetch(`https://www.fast2sms.com/dev/bulkV2`, {
    method: "POST",
    headers: {
      authorization: process.env.FAST2SMS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqBody),
  }).then((res) => res.json());
};
