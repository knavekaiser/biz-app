import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default new Schema(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    name: { type: Schema.Types.String, min: 3, required: true },
    tables: [
      new Schema({
        name: { type: Schema.Types.String, required: true },
        type: { type: Schema.Types.String, required: true },
        module: { type: Schema.Types.String },
        submodule: { type: Schema.Types.String },
      }),
    ],
    columns: [],
    pipeline: [],
  },
  { timestamps: true }
);
