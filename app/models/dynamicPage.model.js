module.exports = mongoose.model(
  "Dynamic Page",
  new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      title: { type: String, required: true },
      description: { type: String },
      path: { type: String, required: true },
      thumbnail: {
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, required: true },
        size: { type: Number, required: true },
      },
      files: [
        new Schema({
          name: { type: String, required: true },
          url: { type: String, required: true },
          type: { type: String, required: true },
          size: { type: Number, required: true },
        }),
      ],
    },
    { timestamps: true }
  )
);
