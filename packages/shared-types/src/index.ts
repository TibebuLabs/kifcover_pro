// ─── User Types ───────────────────────────────────────────────────────────────

export enum UserRole {
  CUSTOMER           = 'CUSTOMER',
  PARTNER_ADMIN      = 'PARTNER_ADMIN',
  PLATFORM_ADMIN     = 'PLATFORM_ADMIN',
  INSURANCE_PROVIDER = 'INSURANCE_PROVIDER',
}

export enum KycStatus {
  PENDING     = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  VERIFIED    = 'VERIFIED',
  REJECTED    = 'REJECTED',
}

export interface UserDto {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  kycStatus: KycStatus;
  isActive: boolean;
  partnerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

// ─── Product Types ────────────────────────────────────────────────────────────

export enum ProductCategory {
  AUTO        = 'AUTO',
  HEALTH      = 'HEALTH',
  TRAVEL      = 'TRAVEL',
  GADGET      = 'GADGET',
  LIFE        = 'LIFE',
  AGRICULTURE = 'AGRICULTURE',
  SME         = 'SME',
}

export enum ProductStatus {
  DRAFT     = 'DRAFT',
  REVIEW    = 'REVIEW',
  PUBLISHED = 'PUBLISHED',
  SUSPENDED = 'SUSPENDED',
}

export interface PricingRuleDto {
  id: string;
  productId: string;
  ruleKey: string;
  operator: string;
  value: string;
  multiplier: number;
}

export interface PremiumTierDto {
  id: string;
  productId: string;
  label: string;
  minAge?: number;
  maxAge?: number;
  sumInsuredMin?: number;
  sumInsuredMax?: number;
  premium: number;
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  descriptionAm?: string;
  category: ProductCategory;
  basePrice: number;
  coverageAmount: number;
  durationDays: number;
  features: string[];
  exclusions: string[];
  termsUrl?: string;
  status: ProductStatus;
  isActive: boolean;
  insurerId?: string;
  pricingRules: PricingRuleDto[];
  premiumTiers: PremiumTierDto[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Quote Types ──────────────────────────────────────────────────────────────

export interface QuoteDto {
  id: string;
  userId?: string;
  productId: string;
  productName: string;
  premium: number;
  coverageAmount: number;
  durationDays: number;
  metadata: Record<string, unknown>;
  expiresAt: Date;
  createdAt: Date;
  product?: ProductDto;
}

// ─── Policy Types ─────────────────────────────────────────────────────────────

export enum PolicyStatus {
  PENDING   = 'PENDING',
  ACTIVE    = 'ACTIVE',
  EXPIRED   = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface PolicyDto {
  id: string;
  policyNumber: string;
  userId: string;
  productId: string;
  productName: string;
  partnerId?: string;
  quoteId?: string;
  status: PolicyStatus;
  premium: number;
  coverageAmount: number;
  startDate: Date;
  endDate: Date;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Claim Types ──────────────────────────────────────────────────────────────

export enum ClaimStatus {
  SUBMITTED    = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED     = 'APPROVED',
  REJECTED     = 'REJECTED',
  PAID         = 'PAID',
}

export interface ClaimDto {
  id: string;
  claimNumber: string;
  userId: string;
  policyId: string;
  policyNumber: string;
  status: ClaimStatus;
  description: string;
  incidentDate: Date;
  claimAmount: number;
  approvedAmount?: number;
  documents: string[];
  adminNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Payment Types ────────────────────────────────────────────────────────────

export enum PaymentStatus {
  PENDING   = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED    = 'FAILED',
  REFUNDED  = 'REFUNDED',
}

export enum PaymentProvider {
  TELEBIRR = 'TELEBIRR',
  BANK     = 'BANK',
  CARD     = 'CARD',
}

export interface PaymentDto {
  id: string;
  policyId?: string;
  claimId?: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerRef?: string;
  checkoutUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Partner Types ────────────────────────────────────────────────────────────

export enum PartnerStatus {
  PENDING   = 'PENDING',
  APPROVED  = 'APPROVED',
  REJECTED  = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export interface PartnerDto {
  id: string;
  name: string;
  slug: string;
  apiKeyProd: string;
  apiKeySandbox: string;
  webhookUrl?: string;
  logoUrl?: string;
  isActive: boolean;
  status: PartnerStatus;
  commissionRate: number;
  adminUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnerStatsDto {
  totalPolicies: number;
  totalRevenue: number;
  activePolicies: number;
  monthlyRevenue: number;
  commissionEarned: number;
  recentPolicies: PolicyDto[];
  recentPayouts: any[];
  apiCallsThisMonth: number;
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

export interface PlatformOverviewDto {
  totalUsers: number;
  totalPolicies: number;
  activePolicies: number;
  totalClaims: number;
  pendingClaims: number;
  grossWrittenPremium: number;
  avgClaimProcessingHours: number;
  activeProducts: number;
  totalPartners: number;
  activePartners: number;
}

// ─── Audit Log Types ──────────────────────────────────────────────────────────

export interface AuditLogDto {
  id: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  service: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// ─── Service Response ─────────────────────────────────────────────────────────

export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

// ─── Inter-service Message Patterns ──────────────────────────────────────────
// All 5 services: svc-auth, svc-customer, svc-insurer, svc-partner, svc-admin

export const MSG = {
  // ── svc-auth ──────────────────────────────────────────────────────────────
  AUTH_REGISTER:      'auth.register',
  AUTH_LOGIN:         'auth.login',
  AUTH_VERIFY_TOKEN:  'auth.verify_token',
  AUTH_SEND_OTP:      'auth.send_otp',
  AUTH_VERIFY_OTP:    'auth.verify_otp',
  AUTH_COMPLETE_PROFILE: 'auth.complete_profile',
  AUTH_CHANGE_PASSWORD:  'auth.change_password',
  AUTH_USERS_PENDING:    'auth.users.pending',
  AUTH_USER_APPROVE:     'auth.user.approve',
  AUTH_USER_REJECT:      'auth.user.reject',

  // ── svc-customer: users ───────────────────────────────────────────────────
  USER_FIND_ALL:      'user.find_all',
  USER_FIND_BY_ID:    'user.find_by_id',
  USER_FIND_BY_EMAIL: 'user.find_by_email',
  USER_UPDATE:        'user.update',
  USER_CHANGE_ROLE:   'user.change_role',
  USER_DEACTIVATE:    'user.deactivate',

  // ── svc-customer: kyc ─────────────────────────────────────────────────────
  KYC_UPLOAD:         'kyc.upload',
  KYC_GET_STATUS:     'kyc.get_status',
  KYC_VERIFY:         'kyc.verify',

  // ── svc-customer: quotes ──────────────────────────────────────────────────
  QUOTE_GENERATE:     'quote.generate',
  QUOTE_FIND_BY_ID:   'quote.find_by_id',

  // ── svc-customer: policies ────────────────────────────────────────────────
  POLICY_ISSUE:       'policy.issue',
  POLICY_FIND_BY_USER:'policy.find_by_user',
  POLICY_FIND_BY_ID:  'policy.find_by_id',
  POLICY_FIND_ALL:    'policy.find_all',
  POLICY_CANCEL:      'policy.cancel',
  POLICY_RENEW:       'policy.renew',

  // ── svc-customer: claims ──────────────────────────────────────────────────
  CLAIM_SUBMIT:       'claim.submit',
  CLAIM_FIND_BY_USER: 'claim.find_by_user',
  CLAIM_FIND_BY_ID:   'claim.find_by_id',
  CLAIM_FIND_ALL:     'claim.find_all',
  CLAIM_REVIEW:       'claim.review',

  // ── svc-customer: payments ────────────────────────────────────────────────
  PAYMENT_INITIATE:       'payment.initiate',
  PAYMENT_CONFIRM:        'payment.confirm',
  PAYMENT_FIND_BY_POLICY: 'payment.find_by_policy',
  PAYMENT_FIND_BY_USER:   'payment.find_by_user',

  // ── svc-insurer: products ─────────────────────────────────────────────────
  PRODUCT_FIND_ALL:    'product.find_all',
  PRODUCT_FIND_ONE:    'product.find_one',
  PRODUCT_CREATE:      'product.create',
  PRODUCT_UPDATE:      'product.update',
  PRODUCT_ADD_RULE:    'product.add_rule',
  PRODUCT_REMOVE_RULE: 'product.remove_rule',
  PRODUCT_STATS:       'product.stats',
  INSURER_OVERVIEW:    'insurer.overview',
  PRODUCT_PUBLISH:     'insurer.product.publish',
  PRODUCT_SUSPEND:     'insurer.product.suspend',
  PRODUCT_CALC_PREMIUM:'insurer.calculate_premium',

  // ── svc-partner ───────────────────────────────────────────────────────────
  PARTNER_CREATE:      'partner.create',
  PARTNER_FIND_ALL:    'partner.find_all',
  PARTNER_FIND_BY_ID:  'partner.find_by_id',
  PARTNER_UPDATE:      'partner.update',
  PARTNER_GET_STATS:   'partner.get_stats',
  PARTNER_REGEN_KEY:   'partner.regen_key',
  PARTNER_APPROVE:     'partner.approve',
  PARTNER_REJECT:      'partner.reject',
  PARTNER_SUSPEND:     'partner.suspend',
  PARTNER_CALC_COMMISSION: 'partner.calculate_commission',

  // ── svc-admin ─────────────────────────────────────────────────────────────
  ANALYTICS_OVERVIEW:       'analytics.overview',
  ANALYTICS_POLICY_TRENDS:  'analytics.policy_trends',
  ANALYTICS_CLAIM_TRENDS:   'analytics.claim_trends',
  ANALYTICS_AUDIT_LOG:      'analytics.audit_log',
  ANALYTICS_AUDIT_LIST:     'analytics.audit_list',
} as const;

export { MicroserviceExceptionFilter } from './rpc-exception.filter';
