// ─── Domain Events (async, fire-and-forget) ───────────────────────────────────
// Published via EventEmitter2 (in-process) or a message broker in production

export const EVENTS = {
  // Auth / User
  USER_REGISTERED:      'user.registered',
  USER_UPDATED:         'user.updated',

  // KYC
  KYC_DOCUMENT_UPLOADED:'kyc.document.uploaded',
  KYC_VERIFIED:         'kyc.verified',
  KYC_REJECTED:         'kyc.rejected',

  // Quotes
  QUOTE_GENERATED:      'quote.generated',
  QUOTE_EXPIRED:        'quote.expired',

  // Policies
  POLICY_ISSUED:        'policy.issued',
  POLICY_ACTIVATED:     'policy.activated',
  POLICY_EXPIRED:       'policy.expired',
  POLICY_CANCELLED:     'policy.cancelled',

  // Claims
  CLAIM_SUBMITTED:      'claim.submitted',
  CLAIM_UNDER_REVIEW:   'claim.under_review',
  CLAIM_APPROVED:       'claim.approved',
  CLAIM_REJECTED:       'claim.rejected',
  CLAIM_PAID:           'claim.paid',

  // Payments
  PAYMENT_INITIATED:    'payment.initiated',
  PAYMENT_COMPLETED:    'payment.completed',
  PAYMENT_FAILED:       'payment.failed',

  // Partners
  PARTNER_REGISTERED:   'partner.registered',
  PAYOUT_TRIGGERED:     'payout.triggered',
} as const;

export type EventName = typeof EVENTS[keyof typeof EVENTS];

// ─── Event Payload Contracts ──────────────────────────────────────────────────

export interface UserRegisteredEvent {
  userId: string;
  email: string;
  firstName: string;
  role: string;
  timestamp: Date;
}

export interface PolicyIssuedEvent {
  policyId: string;
  userId: string;
  productId: string;
  partnerId?: string;
  premium: number;
  coverageAmount: number;
  timestamp: Date;
}

export interface ClaimStatusChangedEvent {
  claimId: string;
  userId: string;
  policyId: string;
  oldStatus: string;
  newStatus: string;
  approvedAmount?: number;
  timestamp: Date;
}

export interface PaymentCompletedEvent {
  paymentId: string;
  policyId?: string;
  claimId?: string;
  amount: number;
  provider: string;
  timestamp: Date;
}

export interface KycStatusChangedEvent {
  userId: string;
  newStatus: string;
  documentType?: string;
  timestamp: Date;
}

export interface PayoutTriggeredEvent {
  partnerId: string;
  policyId: string;
  premium: number;
  commissionRate: number;
  period: string;
  timestamp: Date;
}
