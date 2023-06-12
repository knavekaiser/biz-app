module.exports = mongoose.model(
  "FAQ Document",
  new Schema(
    {
      user: { type: String, required: true },
      topic: { type: String, required: true },
      description: { type: String },
      files: [
        new Schema({
          name: { type: String, required: true },
          url: { type: String, required: true },
          type: { type: String, required: true },
          size: { type: Number, required: true },
        }),
      ],
      urls: [{ type: String }],
    },
    { timestamps: true }
  )
);
