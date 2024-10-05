const paths = {
  signIn: "/signin",
  signUp: "/signup",
  resetPassword: "/reset-password",

  home: "/",

  dashboard: "/dashboard/*",

  businesses: "businesses",

  sales: "sales",
  salesReturns: "sales-returns",
  purchases: "purchases",
  purchaseReturns: "purchase-returns",
  receipts: "receipts",
  payments: "payments",
  journals: "journals",
  orders: "orders",
  quotes: "quotes",
  dynamicTables: "dynamic-tables/*",
  dynamicTable: ":table",
  roles: "roles",
  employees: "employees",
  storeListings: "stores",
  reports: "reports",
  categories: "categories",
  subcategories: "sub-categories",
  subPlans: "subscription-plans",
  accounting: "accounting",
  chats: "chats",
  finPeriods: "financial-periods",

  settings: {
    baseUrl: "settings/*",
    businessInformation: "business-information",
    bankDetails: "bank-details",
    ownerDetails: "owner-details",
    termsAndConditions: "terms-and-conditions",
    config: "config",
    collections: "collections",
    aiChatKnowledgeBase: "ai-chat-knowledge-base",
    siteConfig: "site-config",
    dynamicPages: "dynamic-pages",
    reports: "reports",
  },
};

export default paths;
