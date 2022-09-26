const baseApiUrl = "";

const endpoints = {
  baseApiUrl,
  signUp: `${baseApiUrl}/api/users/signup`,
  signIn: `${baseApiUrl}/api/users/signin`,
  profile: `${baseApiUrl}/api/users/profile`,

  invoices: `${baseApiUrl}/api/invoices`,
  purchases: `${baseApiUrl}/api/purchases`,
  receipts: `${baseApiUrl}/api/receipts`,
  payments: `${baseApiUrl}/api/payments`,

  forgotPassword: `${baseApiUrl}/api/users/forgot-password`,
  resetPassword: `${baseApiUrl}/api/users/reset-password`,
  logout: `${baseApiUrl}/api/users/logout`,
  userConfig: `${baseApiUrl}/api/user-config`,
  collections: `${baseApiUrl}/api/collections`,
  dynamic: `${baseApiUrl}/api/dynamic`,
};

export default endpoints;
