import mongoose from "mongoose";
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    name: { type: Schema.Types.String, min: 3, required: true },
    user: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    fields: [{}],
  },
  { timestamps: true }
);
schema.index({ name: 1, user: 1 }, { unique: true });

export default mongoose.model("Schema", schema);
