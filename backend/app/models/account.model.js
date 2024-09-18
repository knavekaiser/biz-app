import mongoose from "mongoose";
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    name: { type: Schema.Types.String, required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    parent: { type: Schema.Types.String },
    type: { type: Schema.Types.String, required: true },
    isGroup: { type: Boolean, required: true },
    openingBalance: { type: Schema.Types.Number, required: true },
  },
  { timestamps: true }
);
schema.index({ name: 1, user: 1 }, { unique: true });

export default mongoose.model("Account", schema);
