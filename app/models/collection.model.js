module.exports = mongoose.model(
  "Schema",
  new Schema(
    {
      name: { type: Schema.Types.String, min: 3, required: true, unique: true },
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      fields: [{}],
    },
    { timestamps: true }
  )
);
