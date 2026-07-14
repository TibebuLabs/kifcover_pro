/** TCP ports for the 5 KifCover microservices */
export const SERVICE_PORTS = {
  AUTH:     Number(process.env.AUTH_SVC_PORT)     || 3001,
  CUSTOMER: Number(process.env.CUSTOMER_SVC_PORT) || 3002,
  INSURER:  Number(process.env.INSURER_SVC_PORT)  || 3003,
  PARTNER:  Number(process.env.PARTNER_SVC_PORT)  || 3004,
  ADMIN:    Number(process.env.ADMIN_SVC_PORT)     || 3005,
} as const;

export const SERVICE_HOST = process.env.SERVICE_HOST || 'localhost';
