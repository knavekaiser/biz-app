import mongoose from "mongoose";
const Schema = mongoose.Schema;

const schema = new Schema(
  { name: { type: Schema.Types.String, required: true } },
  { timestamps: true }
);

export default schema;
