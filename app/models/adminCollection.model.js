const schema = new Schema(
  {
    name: { type: Schema.Types.String, min: 3, required: true },
    fields: [{}],
  },
  { timestamps: true }
);
schema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("AdminSchema", schema);
