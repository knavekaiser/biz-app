import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default new Schema(
  {
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
