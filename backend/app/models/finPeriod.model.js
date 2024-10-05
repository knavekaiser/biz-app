import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default new Schema(
  {
    label: { type: Schema.Types.String, min: 1, required: true },
    startDate: { type: Schema.Types.Date, required: true },
    endDate: { type: Schema.Types.Date, required: true },
  },
  { timestamps: true }
);
