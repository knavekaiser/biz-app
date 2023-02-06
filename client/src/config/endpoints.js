const baseApiUrl = "";

const endpoints = {
  baseApiUrl,
  signUp: `${baseApiUrl}/api/users/signup`,
  signIn: `${baseApiUrl}/api/users/signin`,
  profile: `${baseApiUrl}/api/users/profile`,

  forgotPassword: `${baseApiUrl}/api/users/forgot-password`,
  resetPassword: `${baseApiUrl}/api/users/reset-password`,
  logout: `${baseApiUrl}/api/users/logout`,

  staffSignUp: `${baseApiUrl}/api/staffs/signup`,
  staffSignIn: `${baseApiUrl}/api/staffs/signin`,
  staffProfile: `${baseApiUrl}/api/staffs/profile`,

  staffForgotPassword: `${baseApiUrl}/api/staffs/forgot-password`,
  staffResetPassword: `${baseApiUrl}/api/staffs/reset-password`,
  staffLogout: `${baseApiUrl}/api/staffs/logout`,

  businesses: `${baseApiUrl}/api/businesses`,

  invoices: `${baseApiUrl}/api/invoices`,
  purchases: `${baseApiUrl}/api/purchases`,
  orders: `${baseApiUrl}/api/orders`,
  generateOrderFromQuote: `${baseApiUrl}/api/orders/generate-from-quote`,
  quotes: `${baseApiUrl}/api/quotes`,
  receipts: `${baseApiUrl}/api/receipts`,
  payments: `${baseApiUrl}/api/payments`,

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
