module.exports = mongoose.model(
  "Chat",
  new Schema(
    {
      topic: { type: String, required: true },
      url: { type: String },
      business: { type: Schema.Types.ObjectId, ref: "User" },
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
            like: { type: Boolean, required: false, default: null },
          },
          { timestamps: true }
        ),
      ],
    },
    { timestamps: true }
  )
);
