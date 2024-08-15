import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default mongoose.model(
  "Category",
  new Schema(
    { name: { type: Schema.Types.String, required: true, unique: true } },
    { timestamps: true }
  )
);
