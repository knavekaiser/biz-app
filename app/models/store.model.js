module.exports = mongoose.model(
  "Store",
  new Schema(
    {
      business: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      category: { type: Schema.Types.String },
      featured: { type: Schema.Types.Boolean, default: false },
      products: [],
      order: [],
    },
    { timestamps: true }
  )
);
