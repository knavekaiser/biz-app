const baseApiUrl = "/";

const endpoints = {
  baseApiUrl,
  signUp: `${baseApiUrl}/api/users/signup`,
  signIn: `${baseApiUrl}/api/users/signin`,
  profile: `${baseApiUrl}/api/users/profile`,
  invoices: `${baseApiUrl}/api/invoices`,
  userConfig: `${baseApiUrl}/api/user-config`,
  logout: `${baseApiUrl}/api/users/logout`,
};

export default endpoints;
