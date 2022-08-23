module.exports = mongoose.model(
  "Payment",
  new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      no: { type: Schema.Types.Number, min: 1, required: true },
      dateTime: { type: Schema.Types.Date, required: true },
      type: { type: Schema.Types.String, required: true },
      amount: { type: Schema.Types.Number, required: true },
      vendor: {
        name: { type: String },
        detail: { type: String },
      },
      purchases: [
        new Schema({
          no: { type: Number, required: true },
          amount: { type: Schema.Types.Number, required: true },
        }),
      ],
    },
    { timestamps: true }
  )
);
