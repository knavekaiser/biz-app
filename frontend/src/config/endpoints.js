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

  businessSignUp: `${baseApiUrl}/api/company/signup`,
  businessSignIn: `${baseApiUrl}/api/company/signin`,
  businessProfile: `${baseApiUrl}/api/company/profile`,

  businessForgotPassword: `${baseApiUrl}/api/company/forgot-password`,
  businessResetPassword: `${baseApiUrl}/api/company/reset-password`,
  businessLogout: `${baseApiUrl}/api/company/logout`,

  staffSignUp: `${baseApiUrl}/api/staff/signup`,
  staffSignIn: `${baseApiUrl}/api/staff/signin`,
  staffProfile: `${baseApiUrl}/api/staff/profile`,

  staffForgotPassword: `${baseApiUrl}/api/staff/forgot-password`,
  staffResetPassword: `${baseApiUrl}/api/staff/reset-password`,
  staffLogout: `${baseApiUrl}/api/staff/logout`,

  businesses: `${baseApiUrl}/api/companies`,
  findBusinesses: `${baseApiUrl}/api/companies/find`,

  invoices: `${baseApiUrl}/api/invoices`,
  purchases: `${baseApiUrl}/api/purchases`,
  orders: `${baseApiUrl}/api/orders`,
  generateOrderFromQuote: `${baseApiUrl}/api/orders/generate-from-quote`,
  quotes: `${baseApiUrl}/api/quotes`,
  receipts: `${baseApiUrl}/api/receipts`,
  payments: `${baseApiUrl}/api/payments`,
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
  schemaTemplates: `${baseApiUrl}/api/collections/templates`,
  dynamic: `${baseApiUrl}/api/dynamic`,
  adminCollections: `${baseApiUrl}/api/admin/collections`,
  adminDynamic: `${baseApiUrl}/api/admin/dynamic`,
  roles: `${baseApiUrl}/api/roles`,
  staffs: `${baseApiUrl}/api/staffs`,
  employees: `${baseApiUrl}/api/employees`,
  dynamicBulkCreate: `${baseApiUrl}/api/dynamic/:table/bulk-create`,

  comifyChat: `${
    process.env.NODE_ENV === "development"
      ? "http://localhost:8060"
      : "https://biz.infinai.in"
  }/assets/sdk/infinai-chat-sdk-v0.9.0.js`,
};

export default endpoints;
