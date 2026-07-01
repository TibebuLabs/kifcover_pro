// ─── User Types ──────────────────────────────────────────────────────────────

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  PARTNER_ADMIN = 'PARTNER_ADMIN',
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  INSURANCE_PROVIDER = 'INSURANCE_PROVIDER',
}

export enum KycStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
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
  AUTO = 'AUTO',
  HEALTH = 'HEALTH',
  TRAVEL = 'TRAVEL',
  GADGET = 'GADGET',
  LIFE = 'LIFE',
  AGRICULTURE = 'AGRICULTURE',
}

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  basePrice: number;
  coverageAmount: number;
  durationDays: number;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Quote Types ──────────────────────────────────────────────────────────────

export interface QuoteDto {
  id: string;
  userId?: string;
  productId: string;
  premium: number;
  coverageAmount: number;
  metadata: Record<string, unknown>;
  expiresAt: Date;
  createdAt: Date;
  product: ProductDto;
}

// ─── Policy Types ─────────────────────────────────────────────────────────────

export enum PolicyStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
}

export interface PolicyDto {
  id: string;
  policyNumber: string;
  userId: string;
  productId: string;
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
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export interface ClaimDto {
  id: string;
  claimNumber: string;
  userId: string;
  policyId: string;
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
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export type PaymentProvider = 'telebirr' | 'bank' | 'card';

export interface PaymentDto {
  id: string;
  policyId?: string;
  claimId?: string;
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

export interface PartnerDto {
  id: string;
  name: string;
  slug: string;
  apiKey: string;
  webhookUrl?: string;
  logoUrl?: string;
  isActive: boolean;
  commissionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnerStatsDto {
  totalPolicies: number;
  totalRevenue: number;
  activePolicies: number;
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
}

// ─── Inter-service Message Patterns ──────────────────────────────────────────

export const MSG = {
  // Auth service
  AUTH_VALIDATE_USER:    'auth.validate_user',
  AUTH_LOGIN:            'auth.login',
  AUTH_REGISTER:         'auth.register',
  AUTH_VERIFY_TOKEN:     'auth.verify_token',

  // User service
  USER_FIND_BY_EMAIL:    'user.find_by_email',
  USER_FIND_BY_ID:       'user.find_by_id',
  USER_CREATE:           'user.create',
  USER_UPDATE:           'user.update',
  USER_FIND_ALL:         'user.find_all',

  // Product service
  PRODUCT_FIND_ALL:      'product.find_all',
  PRODUCT_FIND_ONE:      'product.find_one',
  PRODUCT_CREATE:        'product.create',
  PRODUCT_UPDATE:        'product.update',

  // Quote service
  QUOTE_GENERATE:        'quote.generate',
  QUOTE_FIND_BY_ID:      'quote.find_by_id',

  // Policy service
  POLICY_ISSUE:          'policy.issue',
  POLICY_FIND_BY_USER:   'policy.find_by_user',
  POLICY_FIND_BY_ID:     'policy.find_by_id',
  POLICY_FIND_ALL:       'policy.find_all',

  // Claim service
  CLAIM_SUBMIT:          'claim.submit',
  CLAIM_FIND_BY_USER:    'claim.find_by_user',
  CLAIM_FIND_BY_ID:      'claim.find_by_id',
  CLAIM_FIND_ALL:        'claim.find_all',
  CLAIM_REVIEW:          'claim.review',

  // Payment service
  PAYMENT_INITIATE:      'payment.initiate',
  PAYMENT_CONFIRM:       'payment.confirm',
  PAYMENT_FIND_BY_POLICY:'payment.find_by_policy',

  // KYC service
  KYC_UPLOAD:            'kyc.upload',
  KYC_GET_STATUS:        'kyc.get_status',
  KYC_VERIFY:            'kyc.verify',

  // Partner service
  PARTNER_CREATE:        'partner.create',
  PARTNER_FIND_ALL:      'partner.find_all',
  PARTNER_FIND_BY_ID:    'partner.find_by_id',
  PARTNER_GET_STATS:     'partner.get_stats',
  PARTNER_REGEN_KEY:     'partner.regen_key',

  // Analytics service
  ANALYTICS_OVERVIEW:    'analytics.overview',
  ANALYTICS_POLICY_TRENDS:'analytics.policy_trends',
  ANALYTICS_CLAIM_TRENDS: 'analytics.claim_trends',
} as const;

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

// ─── Service Response Wrapper ─────────────────────────────────────────────────

export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}
