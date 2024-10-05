import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default new Schema(
  {
    username: {
      type: Schema.Types.String,
      unique: [true, "username is taken"],
      sparse: true,
    },
    name: { type: Schema.Types.String, min: 3, required: true },
    phone: {
      type: Schema.Types.String,
      min: 8,
      required: true,
      unique: [true, "Phone is already in use"],
    },
    password: { type: Schema.Types.String, min: 10, required: true },
    email: {
      type: Schema.Types.String,
      unique: [true, "Email is already in use"],
      sparse: true,
    },
    address: { type: Schema.Types.String },
    businesses: [
      new Schema({
        business: {
          type: Schema.Types.ObjectId,
          ref: "Company",
          required: true,
        },
        roles: [{ type: Schema.Types.ObjectId, ref: "Role", required: true }],
      }),
    ],
  },
  { timestamps: true }
);
