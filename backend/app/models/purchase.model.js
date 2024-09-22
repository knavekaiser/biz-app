import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default mongoose.model(
  "Purchase",
  new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "Company", required: true },
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
      accountingEntries: [],
      // vendor: {
      //   name: { type: String },
      //   detail: { type: String },
      // },
    },
    { timestamps: true }
  )
);
