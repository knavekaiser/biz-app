import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    path: { type: String, required: true },
    thumbnail: {
      name: { type: String, required: true },
      url: { type: String, required: true },
      mime: { type: String, required: true },
      size: { type: Number, required: true },
    },
    files: [
      new Schema({
        name: { type: String, required: true },
        url: { type: String, required: true },
        mime: { type: String, required: true },
        size: { type: Number, required: true },
      }),
    ],
  },
  { timestamps: true }
);
