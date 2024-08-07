import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default mongoose.model(
  "Role",
  new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: Schema.Types.String, required: true },
      permissions: [{ type: Schema.Types.String }],
    },
    { timestamps: true }
  )
);
