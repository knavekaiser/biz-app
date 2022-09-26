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
        invoiceNoSuffix: { type: Schema.Types.String },
        purchaseNoSuffix: { type: Schema.Types.String },
        itemColumns: {
          type: Schema.Types.Array,
          default: ["no", "product", "total"],
        },
      },
      numberSeparator: { type: Schema.Types.String, default: "en-US" },
      nextInvoiceNo: { type: Schema.Types.Number, min: 0, default: 1 },
      nextPurchaseNo: { type: Schema.Types.Number, min: 0, default: 1 },
      nextReceiptNo: { type: Schema.Types.Number, min: 0, default: 1 },
      siteConfig: {
        currency: { type: Schema.Types.String, default: "USD" },
        currencies: [
          new Schema({
            currency: { type: Schema.Types.String, required: true },
            symbol: { type: Schema.Types.String, required: true },
          }),
        ],
        landingPage: {
          hero: {
            background: { type: Schema.Types.String },
            slideLabel: { type: Schema.Types.String },
            slides: [
              new Schema({
                title: { type: Schema.Types.String },
                images: [{ type: Schema.Types.String }],
              }),
            ],
          },
        },
        browsePage: {
          sidebarFilters: [],
        },
        productCard: [],
      },
    },
    { timestamps: true }
  )
);
