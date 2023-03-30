const baseApiUrl = "";

const endpoints = {
  baseApiUrl,

  adminSignUp: `${baseApiUrl}/api/admin/signup`,
  adminSignIn: `${baseApiUrl}/api/admin/signin`,
  adminProfile: `${baseApiUrl}/api/admin/profile`,

  adminForgotPassword: `${baseApiUrl}/api/admin/forgot-password`,
  adminResetPassword: `${baseApiUrl}/api/admin/reset-password`,
  adminLogout: `${baseApiUrl}/api/admin/logout`,

  businessSignUp: `${baseApiUrl}/api/business/signup`,
  businessSignIn: `${baseApiUrl}/api/business/signin`,
  businessProfile: `${baseApiUrl}/api/business/profile`,

  businessForgotPassword: `${baseApiUrl}/api/business/forgot-password`,
  businessResetPassword: `${baseApiUrl}/api/business/reset-password`,
  businessLogout: `${baseApiUrl}/api/business/logout`,

  staffSignUp: `${baseApiUrl}/api/staff/signup`,
  staffSignIn: `${baseApiUrl}/api/staff/signin`,
  staffProfile: `${baseApiUrl}/api/staff/profile`,

  staffForgotPassword: `${baseApiUrl}/api/staff/forgot-password`,
  staffResetPassword: `${baseApiUrl}/api/staff/reset-password`,
  staffLogout: `${baseApiUrl}/api/staff/logout`,

  businesses: `${baseApiUrl}/api/businesses`,
  findBusinesses: `${baseApiUrl}/api/businesses/find`,

  invoices: `${baseApiUrl}/api/invoices`,
  purchases: `${baseApiUrl}/api/purchases`,
  orders: `${baseApiUrl}/api/orders`,
  generateOrderFromQuote: `${baseApiUrl}/api/orders/generate-from-quote`,
  quotes: `${baseApiUrl}/api/quotes`,
  receipts: `${baseApiUrl}/api/receipts`,
  payments: `${baseApiUrl}/api/payments`,
  stores: `${baseApiUrl}/api/stores`,

  homeStores: `${baseApiUrl}/api/home/stores`,
  homeCategories: `${baseApiUrl}/api/home/categories`,

  userConfig: `${baseApiUrl}/api/user-config`,
  collections: `${baseApiUrl}/api/collections`,
  schemaTemplates: `${baseApiUrl}/api/collections/templates`,
  dynamic: `${baseApiUrl}/api/dynamic`,
  roles: `${baseApiUrl}/api/roles`,
  staffs: `${baseApiUrl}/api/staffs`,
  employees: `${baseApiUrl}/api/employees`,
  dynamicBulkCreate: `${baseApiUrl}/api/dynamic/:table/bulk-create`,
};

export default endpoints;
