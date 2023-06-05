module.exports = mongoose.model(
  "Chat",
  new Schema(
    {
      topic: { type: String, required: true },
      user: {
        name: { type: String, required: true },
        email: { type: String, required: true },
      },
      messages: [
        new Schema(
          {
            role: { type: String, required: true },
            name: { type: String },
            content: { type: String, required: true },
          },
          { timestamps: true }
        ),
      ],
    },
    { timestamps: true }
  )
);
