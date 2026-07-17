"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MSG = exports.PartnerStatus = exports.PaymentProvider = exports.PaymentStatus = exports.ClaimStatus = exports.PolicyStatus = exports.ProductStatus = exports.ProductCategory = exports.KycStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "CUSTOMER";
    UserRole["PARTNER_ADMIN"] = "PARTNER_ADMIN";
    UserRole["PLATFORM_ADMIN"] = "PLATFORM_ADMIN";
    UserRole["INSURANCE_PROVIDER"] = "INSURANCE_PROVIDER";
})(UserRole || (exports.UserRole = UserRole = {}));
var KycStatus;
(function (KycStatus) {
    KycStatus["PENDING"] = "PENDING";
    KycStatus["IN_PROGRESS"] = "IN_PROGRESS";
    KycStatus["VERIFIED"] = "VERIFIED";
    KycStatus["REJECTED"] = "REJECTED";
})(KycStatus || (exports.KycStatus = KycStatus = {}));
var ProductCategory;
(function (ProductCategory) {
    ProductCategory["AUTO"] = "AUTO";
    ProductCategory["HEALTH"] = "HEALTH";
    ProductCategory["TRAVEL"] = "TRAVEL";
    ProductCategory["GADGET"] = "GADGET";
    ProductCategory["LIFE"] = "LIFE";
    ProductCategory["AGRICULTURE"] = "AGRICULTURE";
    ProductCategory["SME"] = "SME";
})(ProductCategory || (exports.ProductCategory = ProductCategory = {}));
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["DRAFT"] = "DRAFT";
    ProductStatus["REVIEW"] = "REVIEW";
    ProductStatus["PUBLISHED"] = "PUBLISHED";
    ProductStatus["SUSPENDED"] = "SUSPENDED";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
var PolicyStatus;
(function (PolicyStatus) {
    PolicyStatus["PENDING"] = "PENDING";
    PolicyStatus["ACTIVE"] = "ACTIVE";
    PolicyStatus["EXPIRED"] = "EXPIRED";
    PolicyStatus["CANCELLED"] = "CANCELLED";
})(PolicyStatus || (exports.PolicyStatus = PolicyStatus = {}));
var ClaimStatus;
(function (ClaimStatus) {
    ClaimStatus["SUBMITTED"] = "SUBMITTED";
    ClaimStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    ClaimStatus["APPROVED"] = "APPROVED";
    ClaimStatus["REJECTED"] = "REJECTED";
    ClaimStatus["PAID"] = "PAID";
})(ClaimStatus || (exports.ClaimStatus = ClaimStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["COMPLETED"] = "COMPLETED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["TELEBIRR"] = "TELEBIRR";
    PaymentProvider["BANK"] = "BANK";
    PaymentProvider["CARD"] = "CARD";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
var PartnerStatus;
(function (PartnerStatus) {
    PartnerStatus["PENDING"] = "PENDING";
    PartnerStatus["APPROVED"] = "APPROVED";
    PartnerStatus["REJECTED"] = "REJECTED";
    PartnerStatus["SUSPENDED"] = "SUSPENDED";
})(PartnerStatus || (exports.PartnerStatus = PartnerStatus = {}));
exports.MSG = {
    AUTH_REGISTER: 'auth.register',
    AUTH_LOGIN: 'auth.login',
    AUTH_VERIFY_TOKEN: 'auth.verify_token',
    AUTH_SEND_OTP: 'auth.send_otp',
    AUTH_VERIFY_OTP: 'auth.verify_otp',
    AUTH_COMPLETE_PROFILE: 'auth.complete_profile',
    AUTH_CHANGE_PASSWORD: 'auth.change_password',
    USER_FIND_ALL: 'user.find_all',
    USER_FIND_BY_ID: 'user.find_by_id',
    USER_FIND_BY_EMAIL: 'user.find_by_email',
    USER_UPDATE: 'user.update',
    USER_CHANGE_ROLE: 'user.change_role',
    USER_DEACTIVATE: 'user.deactivate',
    KYC_UPLOAD: 'kyc.upload',
    KYC_GET_STATUS: 'kyc.get_status',
    KYC_VERIFY: 'kyc.verify',
    QUOTE_GENERATE: 'quote.generate',
    QUOTE_FIND_BY_ID: 'quote.find_by_id',
    POLICY_ISSUE: 'policy.issue',
    POLICY_FIND_BY_USER: 'policy.find_by_user',
    POLICY_FIND_BY_ID: 'policy.find_by_id',
    POLICY_FIND_ALL: 'policy.find_all',
    POLICY_CANCEL: 'policy.cancel',
    POLICY_RENEW: 'policy.renew',
    CLAIM_SUBMIT: 'claim.submit',
    CLAIM_FIND_BY_USER: 'claim.find_by_user',
    CLAIM_FIND_BY_ID: 'claim.find_by_id',
    CLAIM_FIND_ALL: 'claim.find_all',
    CLAIM_REVIEW: 'claim.review',
    PAYMENT_INITIATE: 'payment.initiate',
    PAYMENT_CONFIRM: 'payment.confirm',
    PAYMENT_FIND_BY_POLICY: 'payment.find_by_policy',
    PAYMENT_FIND_BY_USER: 'payment.find_by_user',
    PRODUCT_FIND_ALL: 'product.find_all',
    PRODUCT_FIND_ONE: 'product.find_one',
    PRODUCT_CREATE: 'product.create',
    PRODUCT_UPDATE: 'product.update',
    PRODUCT_ADD_RULE: 'product.add_rule',
    PRODUCT_REMOVE_RULE: 'product.remove_rule',
    PRODUCT_STATS: 'product.stats',
    PRODUCT_PUBLISH: 'insurer.product.publish',
    PRODUCT_SUSPEND: 'insurer.product.suspend',
    PRODUCT_CALC_PREMIUM: 'insurer.calculate_premium',
    PARTNER_CREATE: 'partner.create',
    PARTNER_FIND_ALL: 'partner.find_all',
    PARTNER_FIND_BY_ID: 'partner.find_by_id',
    PARTNER_UPDATE: 'partner.update',
    PARTNER_GET_STATS: 'partner.get_stats',
    PARTNER_REGEN_KEY: 'partner.regen_key',
    PARTNER_APPROVE: 'partner.approve',
    PARTNER_REJECT: 'partner.reject',
    PARTNER_SUSPEND: 'partner.suspend',
    PARTNER_CALC_COMMISSION: 'partner.calculate_commission',
    ANALYTICS_OVERVIEW: 'analytics.overview',
    ANALYTICS_POLICY_TRENDS: 'analytics.policy_trends',
    ANALYTICS_CLAIM_TRENDS: 'analytics.claim_trends',
    ANALYTICS_AUDIT_LOG: 'analytics.audit_log',
    ANALYTICS_AUDIT_LIST: 'analytics.audit_list',
};
//# sourceMappingURL=index.js.map