import { appConfig } from "../config/index.js";
import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default mongoose.model(
  "Otp",
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
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
