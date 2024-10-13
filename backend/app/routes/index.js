import adminRoutes from "./admin.routes.js";
import companyRoutes from "./company.routes.js";
import staffsRoutes from "./staffs.routes.js";
import configRoutes from "./config.routes.js";
import employeesRoutes from "./employees.routes.js";
import roleRoutes from "./role.routes.js";
import adminCollectionRoutes from "./adminCollection.routes.js";
import adminDynamicRoutes from "./adminDynamic.routes.js";
import adSchemaRoutes from "./adSchema.routes.js";
import storeRoutes from "./store.routes.js";
import subPlanRoutes from "./subPlan.routes.js";

import finPeriodRoutes from "./finPeriod.routes.js";
import reportRoutes from "./report.routes.js";
import chatRoutes from "./chat.routes.js";
import whiteLabelRoutes from "./whiteLabel.routes.js";
import faqDocsRoutes from "./faqDocs.routes.js";
import dynamicPageRoutes from "./dynamicPage.routes.js";
import chatbotRoutes from "./chatbot.routes.js";
import commonRoutes from "./common.routes.js";

import accountingRoutes from "./accounting.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import quoteRoutes from "./quote.routes.js";
import orderRoutes from "./order.routes.js";
import invoiceRoutes from "./invoice.routes.js";
import salesReturnsRoutes from "./salesReturn.routes.js";
import purchaseRoutes from "./purchase.routes.js";
import purchaseReturnRoutes from "./purchaseReturn.routes.js";
import receiptRoutes from "./receipt.routes.js";
import paymentRoutes from "./payment.routes.js";
import journalRoutes from "./journal.routes.js";

import collectionRoutes from "./collection.routes.js";
import dynamicRoutes from "./dynamic.routes.js";

export default function (app) {
  adminRoutes(app);
  companyRoutes(app);
  staffsRoutes(app);
  configRoutes(app);
  employeesRoutes(app);
  roleRoutes(app);
  adminCollectionRoutes(app);
  adminDynamicRoutes(app);
  storeRoutes(app);
  adSchemaRoutes(app);
  subPlanRoutes(app);
  chatbotRoutes(app);
  commonRoutes(app);

  finPeriodRoutes(app);
  reportRoutes(app);
  chatRoutes(app);
  whiteLabelRoutes(app);
  faqDocsRoutes(app);
  dynamicPageRoutes(app);

  accountingRoutes(app);
  inventoryRoutes(app);
  quoteRoutes(app);
  orderRoutes(app);
  invoiceRoutes(app);
  salesReturnsRoutes(app);
  purchaseRoutes(app);
  purchaseReturnRoutes(app);
  receiptRoutes(app);
  paymentRoutes(app);
  journalRoutes(app);

  collectionRoutes(app);
  dynamicRoutes(app);
}
