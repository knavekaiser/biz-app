import mongoose from "mongoose";
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    name: { type: Schema.Types.String, min: 3, required: true, unique: true },
    fields: [{}],
  },
  { timestamps: true }
);

export default schema;
