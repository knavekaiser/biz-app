const {
  appHelper: { normalizeDomain },
} = require("../helpers");

module.exports = mongoose.model(
  "User",
  new Schema(
    {
      username: {
        type: Schema.Types.String,
        unique: [true, "username is taken"],
        sparse: true,
      },
      name: { type: Schema.Types.String, min: 3, required: true },
      motto: { type: Schema.Types.String },
      phone: {
        type: Schema.Types.String,
        min: 8,
        unique: [true, "Phone is already in use"],
        sparse: true,
      },
      whatsappNumber: { type: Schema.Types.String, min: 8 },
      password: { type: Schema.Types.String, min: 10, required: true },
      email: {
        type: Schema.Types.String,
        unique: [true, "Email is already in use"],
        sparse: true,
      },
      domain: {
        type: Schema.Types.String,
        unique: [true, "Domain is being used"],
        get: (v) => normalizeDomain(v) || null,
        set: (v) => normalizeDomain(v) || null,
        sparse: true,
      },
      address: {},
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

      favicon: { type: Schema.Types.String },
      logo: { type: Schema.Types.String },
      gstin: { type: Schema.Types.String },
      pan: { type: Schema.Types.String },
      ifsc: { type: Schema.Types.String },
      description: { type: Schema.Types.String },
      terms: [],
      chatbots: [
        new Schema({
          domain: {
            type: Schema.Types.String,
            required: true,
          },
          primaryColor: {
            type: Schema.Types.String,
            default: null,
          },
          showTopic: {
            type: Schema.Types.Boolean,
            default: true,
          },
        }),
      ],
      subscription: {
        plan: {
          type: Schema.Types.ObjectId,
          ref: "SubscriptionPlan",
          default: null,
        },
        metadata: {},
      },
    },
    { timestamps: true }
  )
);
