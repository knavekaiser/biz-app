import mongoose from "mongoose";
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    category: { type: Schema.Types.String, required: true },
    name: { type: Schema.Types.String, min: 3, required: true },
    fields: [{}],
  },
  { timestamps: true }
);

export default mongoose.model("AdSchema", schema);
