import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default mongoose.model(
  "Invoice",
  new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      no: { type: Schema.Types.Number, min: 1, required: true },
      dateTime: { type: Schema.Types.Date, required: true },
      gst: { type: Schema.Types.Number, min: 0, required: true },
      items: [
        new Schema({
          name: { type: String, required: true },
          price: { type: Schema.Types.Number, required: true },
          qty: { type: Schema.Types.Number, required: true },
          unit: { type: Schema.Types.String, required: true },
        }),
      ],
      customer: {
        name: { type: String },
        detail: { type: String },
      },
      // status: { type: Schema.Types.String, default: "pending", required: true },
    },
    { timestamps: true }
  )
);
