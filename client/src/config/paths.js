const paths = {
  signIn: "/signin",
  signUp: "/signup",
  resetPassword: "/reset-password",

  home: "/",

  dashboard: "/dashboard/*",

  businesses: "businesses",

  sales: "sales",
  purchases: "purchases",
  receipts: "receipts",
  payments: "payments",
  orders: "orders",
  quotes: "quotes",
  dynamicTables: "dynamic-tables/*",
  dynamicTable: ":table",
  roles: "roles",
  employees: "employees",
  stores: "stores",
  storeListings: "stores/:storeId/listings",

  settings: {
    baseUrl: "settings/*",
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
