module.exports = mongoose.model(
  "Role",
  new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: Schema.Types.String, required: true },
      permissions: [{ type: Schema.Types.String }],
    },
    { timestamps: true }
  )
);
