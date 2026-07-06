export declare enum UserRole {
    CUSTOMER = "CUSTOMER",
    PARTNER_ADMIN = "PARTNER_ADMIN",
    PLATFORM_ADMIN = "PLATFORM_ADMIN",
    INSURANCE_PROVIDER = "INSURANCE_PROVIDER"
}
export declare enum KycStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
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
export declare enum ProductCategory {
    AUTO = "AUTO",
    HEALTH = "HEALTH",
    TRAVEL = "TRAVEL",
    GADGET = "GADGET",
    LIFE = "LIFE",
    AGRICULTURE = "AGRICULTURE"
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
export declare enum PolicyStatus {
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED",
    PENDING = "PENDING"
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
export declare enum ClaimStatus {
    SUBMITTED = "SUBMITTED",
    UNDER_REVIEW = "UNDER_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    PAID = "PAID"
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
export declare enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
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
export interface PlatformOverviewDto {
    totalUsers: number;
    totalPolicies: number;
    activePolicies: number;
    totalClaims: number;
    pendingClaims: number;
    grossWrittenPremium: number;
    avgClaimProcessingHours: number;
}
export declare const MSG: {
    readonly AUTH_VALIDATE_USER: "auth.validate_user";
    readonly AUTH_LOGIN: "auth.login";
    readonly AUTH_REGISTER: "auth.register";
    readonly AUTH_VERIFY_TOKEN: "auth.verify_token";
    readonly USER_FIND_BY_EMAIL: "user.find_by_email";
    readonly USER_FIND_BY_ID: "user.find_by_id";
    readonly USER_CREATE: "user.create";
    readonly USER_UPDATE: "user.update";
    readonly USER_FIND_ALL: "user.find_all";
    readonly PRODUCT_FIND_ALL: "product.find_all";
    readonly PRODUCT_FIND_ONE: "product.find_one";
    readonly PRODUCT_CREATE: "product.create";
    readonly PRODUCT_UPDATE: "product.update";
    readonly QUOTE_GENERATE: "quote.generate";
    readonly QUOTE_FIND_BY_ID: "quote.find_by_id";
    readonly POLICY_ISSUE: "policy.issue";
    readonly POLICY_FIND_BY_USER: "policy.find_by_user";
    readonly POLICY_FIND_BY_ID: "policy.find_by_id";
    readonly POLICY_FIND_ALL: "policy.find_all";
    readonly CLAIM_SUBMIT: "claim.submit";
    readonly CLAIM_FIND_BY_USER: "claim.find_by_user";
    readonly CLAIM_FIND_BY_ID: "claim.find_by_id";
    readonly CLAIM_FIND_ALL: "claim.find_all";
    readonly CLAIM_REVIEW: "claim.review";
    readonly PAYMENT_INITIATE: "payment.initiate";
    readonly PAYMENT_CONFIRM: "payment.confirm";
    readonly PAYMENT_FIND_BY_POLICY: "payment.find_by_policy";
    readonly KYC_UPLOAD: "kyc.upload";
    readonly KYC_GET_STATUS: "kyc.get_status";
    readonly KYC_VERIFY: "kyc.verify";
    readonly PARTNER_CREATE: "partner.create";
    readonly PARTNER_FIND_ALL: "partner.find_all";
    readonly PARTNER_FIND_BY_ID: "partner.find_by_id";
    readonly PARTNER_GET_STATS: "partner.get_stats";
    readonly PARTNER_REGEN_KEY: "partner.regen_key";
    readonly ANALYTICS_OVERVIEW: "analytics.overview";
    readonly ANALYTICS_POLICY_TRENDS: "analytics.policy_trends";
    readonly ANALYTICS_CLAIM_TRENDS: "analytics.claim_trends";
};
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
export interface ServiceResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode?: number;
}
