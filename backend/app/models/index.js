import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected to db"))
  .catch((err) => console.log("could not connect to db, here's why: " + err));

export { default as Admin } from "./admin.model.js";
export { default as Config } from "./config.model.js";
export { default as Company } from "./company.model.js";
export { default as Staff } from "./staff.model.js";
export { default as Otp } from "./otp.model.js";
export { default as Invoice } from "./invoice.model.js";
export { default as Receipt } from "./receipt.model.js";
export { default as Purchase } from "./purchase.model.js";
export { default as Payment } from "./payment.model.js";
export { default as Collection } from "./collection.model.js";
export { default as AdminCollection } from "./adminCollection.model.js";
export { default as Order } from "./order.model.js";
export { default as Quote } from "./quote.model.js";
export { default as Role } from "./role.model.js";
export { default as Store } from "./store.model.js";
export { default as AdSchema } from "./adSchema.model.js";
export { default as StoreConfig } from "./storeConfig.model.js";
export { default as SubPlan } from "./subPlan.model.js";
export { default as FaqDoc } from "./faqDoc.model.js";
export { default as Chat } from "./chat.model.js";
export { default as DynamicPage } from "./dynamicPage.model.js";
export { default as Module } from "./module.model.js";
export { default as Submodule } from "./submodule.model.js";
export { default as Report } from "./report.model.js";
export { default as Account } from "./account.model.js";
