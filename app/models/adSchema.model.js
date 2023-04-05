const schema = new Schema(
  {
    category: { type: Schema.Types.String, required: true },
    subCategory: { type: Schema.Types.String, required: true },
    name: { type: Schema.Types.String, min: 3, required: true },
    fields: [{}],
  },
  { timestamps: true }
);
schema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("AdSchema", schema);
