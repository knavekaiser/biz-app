import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default mongoose.model(
  "Report",
  new Schema(
    {
      company: { type: Schema.Types.ObjectId, ref: "Company" },
      name: { type: Schema.Types.String, min: 3, required: true },
      table: {
        name: { type: Schema.Types.String, required: true },
        type: { type: Schema.Types.String, required: true },
      },
      columns: [],
      pipeline: [],
    },
    { timestamps: true }
  )
);
