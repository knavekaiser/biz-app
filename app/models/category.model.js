module.exports = mongoose.model(
  "Category",
  new Schema(
    { name: { type: Schema.Types.String, required: true, unique: true } },
    { timestamps: true }
  )
);
