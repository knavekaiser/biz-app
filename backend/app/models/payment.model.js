import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default new Schema(
  {
    no: { type: Schema.Types.Number, min: 1, required: true },
    dateTime: { type: Schema.Types.Date, required: true },
    // type: { type: Schema.Types.String, required: true },
    amount: { type: Schema.Types.Number, required: true },
    vendor: {
      //   name: { type: String },
      detail: { type: String },
    },
    purchases: [
      new Schema({
        no: { type: Number, required: true },
        amount: { type: Schema.Types.Number, required: true },
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
  },
  { timestamps: true }
);
