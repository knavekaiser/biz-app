import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default mongoose.model(
  "FAQ Document",
  new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      parentTopic: {
        type: Schema.Types.ObjectId,
        ref: "FAQ Document",
        default: null,
      },
      topic: { type: String, required: true },
      description: { type: String },
      showOnChat: { type: Schema.Types.Boolean, default: true },
      files: [
        new Schema({
          name: { type: String, required: true },
          url: { type: String, required: true },
          type: { type: String, required: true },
          size: { type: Number, required: true },
        }),
      ],
      urls: [{ type: String }],
      content: { type: String, default: null },
      paths: [{ type: String }],
      contextForUsers: { type: String, max: 200 },
      tokenCount: { type: Number, default: 0, required: true },
      vectorIds: [{ type: String }],
    },
    { timestamps: true }
  )
);
