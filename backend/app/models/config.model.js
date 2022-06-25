module.exports = mongoose.model(
  "Config",
  new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      unitsOfMeasure: {
        type: Schema.Types.Array,
        default: ["Piece", "Gram", "Kilograms", "Milliliter", "Litter"],
      },
      print: {
        currency: { type: Schema.Types.String, max: 3, default: "INR" },
        itemColumns: {
          type: Schema.Types.Array,
          default: ["no", "product", "total"],
        },
      },
      nextInvoiceNo: { type: Schema.Types.Number, min: 0, default: 1 },
    },
    { timestamps: true }
  )
);
