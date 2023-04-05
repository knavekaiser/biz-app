module.exports = mongoose.model(
  "StoreConfig",
  new Schema(
    {
      sidebarFilters: [],
    },
    { timestamps: true }
  )
);
