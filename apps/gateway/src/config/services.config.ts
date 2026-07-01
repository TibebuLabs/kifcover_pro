/** TCP ports for each microservice */
export const SERVICE_PORTS = {
  AUTH:      Number(process.env.AUTH_SVC_PORT)      || 3001,
  USERS:     Number(process.env.USERS_SVC_PORT)     || 3002,
  PRODUCTS:  Number(process.env.PRODUCTS_SVC_PORT)  || 3003,
  QUOTES:    Number(process.env.QUOTES_SVC_PORT)    || 3004,
  POLICIES:  Number(process.env.POLICIES_SVC_PORT)  || 3005,
  CLAIMS:    Number(process.env.CLAIMS_SVC_PORT)    || 3006,
  PAYMENTS:  Number(process.env.PAYMENTS_SVC_PORT)  || 3007,
  KYC:       Number(process.env.KYC_SVC_PORT)       || 3008,
  PARTNERS:  Number(process.env.PARTNERS_SVC_PORT)  || 3009,
  ANALYTICS: Number(process.env.ANALYTICS_SVC_PORT) || 3010,
} as const;

export const SERVICE_HOST = process.env.SERVICE_HOST || 'localhost';
