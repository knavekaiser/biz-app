import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default mongoose.model(
  "Journal",
  new Schema(
    {
      company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
      accountId: {
        type: Schema.Types.ObjectId,
        ref: "Account",
        required: true,
      },
      accountName: { type: Schema.Types.String, required: true },
      debit: { type: Schema.Types.Number, required: true },
      credit: { type: Schema.Types.Number, required: true },
    },
    { timestamps: true }
  )
);
