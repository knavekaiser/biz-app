import mongoose from "mongoose";
const Schema = mongoose.Schema;

export default new Schema(
  {
    sidebarFilters: [],
  },
  { timestamps: true }
);
