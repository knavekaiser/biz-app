const schema = new Schema(
  {
    name: { type: Schema.Types.String, min: 3, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fields: [{}],
  },
  { timestamps: true }
);
schema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Schema", schema);
