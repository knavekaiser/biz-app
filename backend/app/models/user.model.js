module.exports = mongoose.model(
  "User",
  new Schema(
    {
      name: { type: Schema.Types.String, min: 3, required: true },
      motto: { type: Schema.Types.String },
      phone: {
        type: Schema.Types.String,
        min: 8,
        required: true,
        unique: [true, "Phone is already in use"],
      },
      password: { type: Schema.Types.String, min: 10, required: true },
      email: {
        type: Schema.Types.String,
        unique: [true, "Email is already in use"],
        sparse: true,
      },
      address: { type: Schema.Types.String },
      bankDetails: {
        bankName: { type: Schema.Types.String },
        branch: { type: Schema.Types.String },
        accNo: { type: Schema.Types.String },
        accName: { type: Schema.Types.String },
      },

      ownerDetails: {
        name: { type: Schema.Types.String },
        phone: { type: Schema.Types.String },
        email: { type: Schema.Types.String },
        signature: { type: Schema.Types.String },
      },

      logo: { type: Schema.Types.String },
      gstin: { type: Schema.Types.String },
      pan: { type: Schema.Types.String },
      ifsc: { type: Schema.Types.String },
      terms: [],
    },
    { timestamps: true }
  )
);
