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
  storeListings: "stores",
  categories: "categories",
  subCategories: "sub-categories",
  subPlans: "subscription-plans",

  settings: {
    baseUrl: "settings/*",
    businessInformation: "business-information",
    bankDetails: "bank-details",
    ownerDetails: "owner-details",
    termsAndConditions: "terms-and-conditions",
    config: "config",
    collections: "collections",
    documents: "documents",
    siteConfig: "site-config",
  },
};

export default paths;
