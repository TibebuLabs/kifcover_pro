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
    AGRICULTURE = "AGRICULTURE",
    SME = "SME"
}
export declare enum ProductStatus {
    DRAFT = "DRAFT",
    REVIEW = "REVIEW",
    PUBLISHED = "PUBLISHED",
    SUSPENDED = "SUSPENDED"
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
export declare enum PolicyStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
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
export declare enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare enum PaymentProvider {
    TELEBIRR = "TELEBIRR",
    BANK = "BANK",
    CARD = "CARD"
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
export declare enum PartnerStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    SUSPENDED = "SUSPENDED"
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
export declare const MSG: {
    readonly AUTH_REGISTER: "auth.register";
    readonly AUTH_LOGIN: "auth.login";
    readonly AUTH_VERIFY_TOKEN: "auth.verify_token";
    readonly AUTH_SEND_OTP: "auth.send_otp";
    readonly AUTH_VERIFY_OTP: "auth.verify_otp";
    readonly AUTH_COMPLETE_PROFILE: "auth.complete_profile";
    readonly AUTH_CHANGE_PASSWORD: "auth.change_password";
    readonly USER_FIND_ALL: "user.find_all";
    readonly USER_FIND_BY_ID: "user.find_by_id";
    readonly USER_FIND_BY_EMAIL: "user.find_by_email";
    readonly USER_UPDATE: "user.update";
    readonly USER_CHANGE_ROLE: "user.change_role";
    readonly USER_DEACTIVATE: "user.deactivate";
    readonly KYC_UPLOAD: "kyc.upload";
    readonly KYC_GET_STATUS: "kyc.get_status";
    readonly KYC_VERIFY: "kyc.verify";
    readonly QUOTE_GENERATE: "quote.generate";
    readonly QUOTE_FIND_BY_ID: "quote.find_by_id";
    readonly POLICY_ISSUE: "policy.issue";
    readonly POLICY_FIND_BY_USER: "policy.find_by_user";
    readonly POLICY_FIND_BY_ID: "policy.find_by_id";
    readonly POLICY_FIND_ALL: "policy.find_all";
    readonly POLICY_CANCEL: "policy.cancel";
    readonly POLICY_RENEW: "policy.renew";
    readonly CLAIM_SUBMIT: "claim.submit";
    readonly CLAIM_FIND_BY_USER: "claim.find_by_user";
    readonly CLAIM_FIND_BY_ID: "claim.find_by_id";
    readonly CLAIM_FIND_ALL: "claim.find_all";
    readonly CLAIM_REVIEW: "claim.review";
    readonly PAYMENT_INITIATE: "payment.initiate";
    readonly PAYMENT_CONFIRM: "payment.confirm";
    readonly PAYMENT_FIND_BY_POLICY: "payment.find_by_policy";
    readonly PAYMENT_FIND_BY_USER: "payment.find_by_user";
    readonly PRODUCT_FIND_ALL: "product.find_all";
    readonly PRODUCT_FIND_ONE: "product.find_one";
    readonly PRODUCT_CREATE: "product.create";
    readonly PRODUCT_UPDATE: "product.update";
    readonly PRODUCT_ADD_RULE: "product.add_rule";
    readonly PRODUCT_REMOVE_RULE: "product.remove_rule";
    readonly PRODUCT_STATS: "product.stats";
    readonly PRODUCT_PUBLISH: "insurer.product.publish";
    readonly PRODUCT_SUSPEND: "insurer.product.suspend";
    readonly PRODUCT_CALC_PREMIUM: "insurer.calculate_premium";
    readonly PARTNER_CREATE: "partner.create";
    readonly PARTNER_FIND_ALL: "partner.find_all";
    readonly PARTNER_FIND_BY_ID: "partner.find_by_id";
    readonly PARTNER_UPDATE: "partner.update";
    readonly PARTNER_GET_STATS: "partner.get_stats";
    readonly PARTNER_REGEN_KEY: "partner.regen_key";
    readonly PARTNER_APPROVE: "partner.approve";
    readonly PARTNER_REJECT: "partner.reject";
    readonly PARTNER_SUSPEND: "partner.suspend";
    readonly PARTNER_CALC_COMMISSION: "partner.calculate_commission";
    readonly ANALYTICS_OVERVIEW: "analytics.overview";
    readonly ANALYTICS_POLICY_TRENDS: "analytics.policy_trends";
    readonly ANALYTICS_CLAIM_TRENDS: "analytics.claim_trends";
    readonly ANALYTICS_AUDIT_LOG: "analytics.audit_log";
    readonly ANALYTICS_AUDIT_LIST: "analytics.audit_list";
};
