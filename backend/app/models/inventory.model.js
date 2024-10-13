import mongoose from "mongoose";
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    name: { type: Schema.Types.String, required: true },
    parent: { type: Schema.Types.ObjectId, ref: "Inventory" },
    type: { type: Schema.Types.String },
    isGroup: { type: Boolean, required: true },
    openingStocks: [
      new Schema({
        branch: { type: Schema.Types.ObjectId, ref: "InventoryBranch" },
        openingStock: { type: Schema.Types.Number, required: true },
        cost: { type: Schema.Types.Number, required: true },
        reorderQty: { type: Schema.Types.Number, required: true },
      }),
    ],
  },
  { timestamps: true }
);

export default schema;
