const baseApiUrl = "";

const endpoints = {
  baseApiUrl,
  signUp: `${baseApiUrl}/api/users/signup`,
  signIn: `${baseApiUrl}/api/users/signin`,
  profile: `${baseApiUrl}/api/users/profile`,

  invoices: `${baseApiUrl}/api/invoices`,
  purchases: `${baseApiUrl}/api/purchases`,
  orders: `${baseApiUrl}/api/orders`,
  quotes: `${baseApiUrl}/api/quotes`,
  receipts: `${baseApiUrl}/api/receipts`,
  payments: `${baseApiUrl}/api/payments`,

  forgotPassword: `${baseApiUrl}/api/users/forgot-password`,
  resetPassword: `${baseApiUrl}/api/users/reset-password`,
  logout: `${baseApiUrl}/api/users/logout`,
  userConfig: `${baseApiUrl}/api/user-config`,
  collections: `${baseApiUrl}/api/collections`,
  schemaTemplates: `${baseApiUrl}/api/collections/templates`,
  dynamic: `${baseApiUrl}/api/dynamic`,
  dynamicBulkCreate: `${baseApiUrl}/api/dynamic/:table/bulk-create`,
};

export default endpoints;
