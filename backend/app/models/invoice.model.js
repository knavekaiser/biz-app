import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default new Schema(
  {
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
    accountingEntries: [
      new Schema({
        accountId: {
          type: Schema.Types.ObjectId,
          ref: "Account",
          required: true,
        },
        accountName: { type: Schema.Types.String, required: true },
        debit: { type: Schema.Types.Number, required: true },
        credit: { type: Schema.Types.Number, required: true },
      }),
    ],
    customer: {
      // name: { type: String },
      detail: { type: String },
    },
    // status: { type: Schema.Types.String, default: "pending", required: true },
  },
  { timestamps: true }
);
