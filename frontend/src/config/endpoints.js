const baseApiUrl = "";

const endpoints = {
  baseApiUrl,

  adminSignUp: `${baseApiUrl}/api/admin/signup`,
  adminSignIn: `${baseApiUrl}/api/admin/signin`,
  adminProfile: `${baseApiUrl}/api/admin/profile`,

  adminForgotPassword: `${baseApiUrl}/api/admin/forgot-password`,
  adminResetPassword: `${baseApiUrl}/api/admin/reset-password`,
  adminLogout: `${baseApiUrl}/api/admin/logout`,
  adminSwitchAccount: `${baseApiUrl}/api/admin/switch-account`,

  companySignUp: `${baseApiUrl}/api/company/signup`,
  companySignIn: `${baseApiUrl}/api/company/signin`,
  companyProfile: `${baseApiUrl}/api/company/profile`,

  companyForgotPassword: `${baseApiUrl}/api/company/forgot-password`,
  companyResetPassword: `${baseApiUrl}/api/company/reset-password`,
  companyLogout: `${baseApiUrl}/api/company/logout`,

  staffSignUp: `${baseApiUrl}/api/staff/signup`,
  staffSignIn: `${baseApiUrl}/api/staff/signin`,
  staffProfile: `${baseApiUrl}/api/staff/profile`,

  staffForgotPassword: `${baseApiUrl}/api/staff/forgot-password`,
  staffResetPassword: `${baseApiUrl}/api/staff/reset-password`,
  staffLogout: `${baseApiUrl}/api/staff/logout`,

  businesses: `${baseApiUrl}/api/companies`,
  findBusinesses: `${baseApiUrl}/api/companies/find`,
  finPeriods: `${baseApiUrl}/api/financial-periods`,

  invoices: `${baseApiUrl}/api/invoices`,
  salesReturns: `${baseApiUrl}/api/sales-returns`,
  purchases: `${baseApiUrl}/api/purchases`,
  purchaseReturns: `${baseApiUrl}/api/purchase-returns`,
  orders: `${baseApiUrl}/api/orders`,
  generateOrderFromQuote: `${baseApiUrl}/api/orders/generate-from-quote`,
  quotes: `${baseApiUrl}/api/quotes`,
  receipts: `${baseApiUrl}/api/receipts`,
  payments: `${baseApiUrl}/api/payments`,
  journals: `${baseApiUrl}/api/journals`,
  stores: `${baseApiUrl}/api/stores`,
  storeConfig: `${baseApiUrl}/api/store-config`,
  categories: `${baseApiUrl}/api/categories`,
  subPlans: `${baseApiUrl}/api/sub-plans`,
  faqDocuments: `${baseApiUrl}/api/faq-documents`,
  dynamicPages: `${baseApiUrl}/api/manage-dynamic-pages`,

  homeStores: `${baseApiUrl}/api/home/stores`,
  homeCategories: `${baseApiUrl}/api/home/store-categories`,
  homeConfig: `${baseApiUrl}/api/home/config`,
  homeLocations: `${baseApiUrl}/api/home/locations`,
  adSchemas: `${baseApiUrl}/api/ad-schemas`,

  userConfig: `${baseApiUrl}/api/user-config`,
  chats: `${baseApiUrl}/api/chats`,
  collections: `${baseApiUrl}/api/collections`,
  allCollections: `${baseApiUrl}/api/collections/all`,
  schemaTemplates: `${baseApiUrl}/api/collections/templates`,
  dynamic: `${baseApiUrl}/api/dynamic`,
  adminCollections: `${baseApiUrl}/api/admin/collections`,
  adminDynamic: `${baseApiUrl}/api/admin/dynamic`,
  roles: `${baseApiUrl}/api/roles`,
  staffs: `${baseApiUrl}/api/staffs`,
  employees: `${baseApiUrl}/api/employees`,
  dynamicBulkCreate: `${baseApiUrl}/api/dynamic/:table/bulk-create`,

  reports: `${baseApiUrl}/api/reports`,
  generateReport: `${baseApiUrl}/api/reports/generate`,
  generateReportPipeline: `${baseApiUrl}/api/reports/generate-pipeline`,
  testReportPipeline: `${baseApiUrl}/api/reports/test-pipeline`,

  accountingMasters: `${baseApiUrl}/api/accounting/masters`,
  accountingVouchers: `${baseApiUrl}/api/accounting/vouchers`,
  accountingLedgers: `${baseApiUrl}/api/accounting/ledgers`,
  accountingMonthlyAnalysys: `${baseApiUrl}/api/accounting/monthly-analysys`,
  journals: `${baseApiUrl}/api/journals`,

  inventoryMasters: `${baseApiUrl}/api/inventory/masters`,
  inventoryLedgers: `${baseApiUrl}/api/inventory/ledgers`,
  inventoryListing: `${baseApiUrl}/api/inventory/listings`,
  inventoryBranches: `${baseApiUrl}/api/inventory-branches`,
  inventoryMonthlyAnalysys: `${baseApiUrl}/api/inventory/monthly-analysys`,

  comifyChat: `${
    process.env.NODE_ENV === "development"
      ? "http://localhost:8060"
      : "https://biz.infinai.in"
  }/assets/sdk/infinai-chat-sdk-v0.9.0.js`,
};

export default endpoints;
