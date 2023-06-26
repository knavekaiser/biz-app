module.exports = mongoose.model(
  "SubscriptionPlan",
  new Schema(
    {
      name: { type: Schema.Types.String, required: true },
      price: { type: Schema.Types.Number, min: 0, required: true },
      duration: { type: Schema.Types.Number, min: 1, required: true }, // in days
      features: {
        maxProduct: { type: Schema.Types.Number, min: 0, required: true },
        maxAiChatToken: { type: Schema.Types.Number, min: 0, required: true },
        maxAiChatContextToken: {
          type: Schema.Types.Number,
          min: 0,
          required: true,
        },
      },
      // dateTime: { type: Schema.Types.Date, required: true },
      // gst: { type: Schema.Types.Number, min: 0, required: true },
      // status: { type: Schema.Types.String, default: "active", required: true },
    },
    { timestamps: true }
  )
);
