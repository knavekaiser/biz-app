import mongoose from "mongoose";
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    name: { type: Schema.Types.String, required: true },
    parent: { type: Schema.Types.ObjectId, ref: "Account" },
    type: { type: Schema.Types.String },
    isGroup: { type: Boolean, required: true },
    openingStocks: [
      new Schema({
        branch: { type: Schema.Types.String, required: true },
        amount: { type: Schema.Types.Number, required: true },
      }),
    ],
  },
  { timestamps: true }
);

export default schema;
