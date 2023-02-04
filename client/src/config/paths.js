const paths = {
  signIn: "/signin",
  signUp: "/signup",
  resetPassword: "/reset-password",
  staffSignUp: "/staff-signup",
  staffSignIn: "/staff-signin",
  staffResetPassword: "/staff-reset-password",

  businesses: "/businesses",

  sales: "/sales",
  purchases: "/purchases",
  receipts: "/receipts",
  payments: "/payments",
  orders: "/orders",
  quotes: "/quotes",
  dynamicTables: "/dynamic-tables/*",
  dynamicTable: "/dynamic-tables/:table",
  roles: "/roles",
  employees: "/employees",

  settings: {
    baseUrl: "/settings/*",
    businessInformation: "business-information",
    bankDetails: "bank-details",
    ownerDetails: "owner-details",
    termsAndConditions: "terms-and-conditions",
    config: "config",
    collections: "collections",
    siteConfig: "site-config",
  },
};

export default paths;
