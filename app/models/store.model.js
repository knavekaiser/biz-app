module.exports = mongoose.model(
  "Store",
  new Schema(
    {
      name: { type: Schema.Types.String, min: 3, required: true },
      image: { type: Schema.Types.String },
      featured: { type: Schema.Types.Boolean, default: false },
      business: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    { timestamps: true }
  )
);
