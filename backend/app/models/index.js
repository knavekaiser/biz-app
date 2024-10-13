import mongoose from "mongoose";

import admin from "./admin.model.js";
import config from "./config.model.js";
import company from "./company.model.js";
import staff from "./staff.model.js";
import otp from "./otp.model.js";
import adminColl from "./adminCollection.model.js";
import role from "./role.model.js";
import store from "./store.model.js";
import adSchema from "./adSchema.model.js";
import storeConfig from "./storeConfig.model.js";
import subPlan from "./subPlan.model.js";

import FinancialPeriod from "./finPeriod.model.js";
import Report from "./report.model.js";
import FaqDoc from "./faqDoc.model.js";
import Chat from "./chat.model.js";
import Module from "./module.model.js";
import Submodule from "./submodule.model.js";
import DynamicPage from "./dynamicPage.model.js";

import Account from "./account.model.js";
import Inventory from "./inventory.model.js";
import InventoryBranch from "./inventoryBranch.model.js";
import Quote from "./quote.model.js";
import Order from "./order.model.js";
import Invoice from "./invoice.model.js";
import SalesReturn from "./salesReturn.model.js";
import Purchase from "./purchase.model.js";
import PurchaseReturn from "./purchaseReturn.model.js";
import Receipt from "./receipt.model.js";
import Payment from "./payment.model.js";
import Journal from "./journal.model.js";
import Collection from "./collection.model.js";

// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("connected to db"))
//   .catch((err) => console.log("could not connect to db, here's why: " + err));

export const dbConn = await mongoose
  .createConnection(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .asPromise();

export const mainDB = dbConn.useDb(process.env.PRIMARY_DB, { useCache: true });

// ======================================================== Primary Collections
export const Admin = mainDB.model("Admin", admin);
export const Company = mainDB.model("Company", company);
export const Config = mainDB.model("Config", config);
export const Staff = mainDB.model("Staff", staff);
export const Otp = mainDB.model("Otp", otp);
export const Role = mainDB.model("Role", role);
export const SubPlan = mainDB.model("SubscriptionPlan", subPlan);
export const AdminCollection = mainDB.model("AdminSchema", adminColl);
export const Store = mainDB.model("Store", store);
export const AdSchema = mainDB.model("AdSchema", adSchema);
export const StoreConfig = mainDB.model("StoreConfig", storeConfig);

// ======================================================== Proprietary Collections
export const getModel = ({ companyId, name, finPeriodId }) => {
  const db = dbConn.useDb(
    `${process.env.PRIMARY_DB}_${companyId}${
      finPeriodId ? "_" + finPeriodId : ""
    }`,
    { useCache: true }
  );
  const schemas = {
    FinancialPeriod,
    Report,
    FaqDoc,
    Chat,
    Module,
    Submodule,
    DynamicPage,

    Account,
    Inventory,
    InventoryBranch,
    Quote,
    Order,
    Invoice,
    SalesReturn,
    Purchase,
    PurchaseReturn,
    Receipt,
    Payment,
    Journal,
    Collection,
  };
  return schemas[name] ? db.model(name, schemas[name]) : null;
};
