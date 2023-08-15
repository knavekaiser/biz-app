module.exports = mongoose.model(
  "Chat",
  new Schema(
    {
      topic: { type: String, required: true },
      faqDoc: { type: Schema.Types.ObjectId, ref: "FAQ Document" },
      parentTopic: { type: String },
      parentFaqDoc: { type: Schema.Types.ObjectId, ref: "FAQ Document" },
      url: { type: String },
      business: { type: Schema.Types.ObjectId, ref: "User" },
      user: {
        name: { type: String, required: true },
        email: { type: String, required: true },
      },
      fullContext: { type: Boolean },
      messages: [
        new Schema(
          {
            role: { type: String, required: true },
            name: { type: String },
            content: { type: String, required: true },
            like: { type: Boolean, required: false, default: null },
            token: { type: Number, required: false },
          },
          { timestamps: true }
        ),
      ],
    },
    { timestamps: true }
  )
);
