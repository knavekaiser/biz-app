import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default mongoose.model(
  "StoreConfig",
  new Schema(
    {
      sidebarFilters: [],
    },
    { timestamps: true }
  )
);
