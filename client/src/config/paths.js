const paths = {
  signIn: "/signin",
  signUp: "/signup",
  resetPassword: "/reset-password",
  sales: "/sales",
  purchases: "/purchases",
  receipts: "/receipts",
  payments: "/payments",
  dynamicTables: "/dynamic-tables/*",
  dynamicTable: "/dynamic-tables/:table",
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
