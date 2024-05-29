import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default mongoose.model(
  "Store",
  new Schema(
    {
      business: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      category: { type: Schema.Types.String },
      subcategory: { type: Schema.Types.String },
      start: { type: Schema.Types.Date },
      end: { type: Schema.Types.Date },
      featured: { type: Schema.Types.Boolean, default: false },
      products: [],
      order: [],
      createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    },
    { timestamps: true }
  )
);
