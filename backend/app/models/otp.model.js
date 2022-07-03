const { appConfig } = require("../config");

module.exports = mongoose.model(
  "Otp",
  new Schema(
    {
      user: {
        type: String,
        required: true,
        unique: true,
      },
      code: { type: String, required: true },
      createdAt: {
        type: Date,
        default: new Date(),
        expires: appConfig.otpTimeout,
      },
      attempts: { type: Number, default: 0 },
    },
    { timestamps: true }
  )
);
