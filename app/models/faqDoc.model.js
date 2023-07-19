module.exports = mongoose.model(
  "FAQ Document",
  new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
      tokenCount: { type: Number, default: 0, required: true },
    },
    { timestamps: true }
  )
);
