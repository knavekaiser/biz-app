import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default new Schema(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    module: { type: Schema.Types.ObjectId, ref: "Module" },
    name: { type: Schema.Types.String, min: 3, required: true },
    fields: [],
    config: {
      defaultScheduleField: { type: Schema.Types.String },
      actions: [
        new Schema({
          name: { type: Schema.Types.String, required: true },
          description: { type: Schema.Types.String, required: true },
          coll: { type: Schema.Types.String, required: true },
          prompt: { type: Schema.Types.String, required: true },
          pipeline: [],
        }),
      ],
      prompts: [
        new Schema({
          name: { type: Schema.Types.String, required: true },
          prompt: { type: Schema.Types.String, required: true },
          status: { type: Schema.Types.String, required: true },
        }),
      ],
    },
  },
  { timestamps: true }
);
