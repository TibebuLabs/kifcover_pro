import axios from 'axios'
import Cookies from 'js-cookie'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('kif_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 clear session and redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.includes('/auth/')
    if (err.response?.status === 401 && !isAuthEndpoint && typeof window !== 'undefined') {
      Cookies.remove('kif_token')
      try {
        const store = JSON.parse(localStorage.getItem('kif-auth') || '{}')
        if (store.state) { store.state.user = null; store.state.token = null }
        localStorage.setItem('kif-auth', JSON.stringify(store))
      } catch {}
      window.location.href = '/auth/login'
    }
    return Promise.reject(err)
  },
)

// ─── Typed API helpers ────────────────────────────────────────────────────────

// Auth
export const authApi = {
  register: (d: { firstName: string; lastName: string; email: string; phone?: string; password: string; role?: string }) =>
    api.post('/auth/register', d),
  login: (d: { email: string; password: string }) =>
    api.post('/auth/login', d),
  sendOtp: (phone: string) =>
    api.post('/auth/otp/send', { phone }),
  verifyOtp: (phone: string, code: string) =>
    api.post('/auth/otp/verify', { phone, code }),
  changePassword: (d: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/change-password', d),
  completeProfile: (d: { firstName: string; lastName: string; email?: string }) =>
    api.post('/auth/complete-profile', d),
}

// Customer — profile, KYC
export const userApi = {
  me:          ()                        => api.get('/users/me'),
  update:      (d: any)                  => api.patch('/users/me', d),
  kycUpload:   (d: any)                  => api.post('/kyc/upload', d),
  kycStatus:   ()                        => api.get('/kyc/status'),
}

// Products (public)
export const productApi = {
  list:            (category?: string)   => api.get('/products', { params: { category } }),
  get:             (id: string)          => api.get(`/products/${id}`),
  calcPremium:     (id: string, meta: any) => api.post(`/insurer/products/${id}/calculate-premium`, { metadata: meta }),
}

// Quotes
export const quoteApi = {
  generate: (productId: string, metadata: any) =>
    api.post('/quotes/generate', { productId, metadata }),
  get: (id: string) =>
    api.get(`/quotes/${id}`),
}

// Policies
export const policyApi = {
  issue:    (quoteId: string, partnerId?: string) =>
    api.post('/policies/issue', { quoteId, partnerId }),
  my:       ()                                    => api.get('/policies/my'),
  get:      (id: string)                          => api.get(`/policies/${id}`),
  cancel:   (id: string)                          => api.post(`/policies/${id}/cancel`),
  all:      (params?: any)                        => api.get('/policies', { params }),
}

// Claims
export const claimApi = {
  submit:   (d: any)        => api.post('/claims', d),
  my:       ()              => api.get('/claims/my'),
  get:      (id: string)    => api.get(`/claims/${id}`),
  all:      (params?: any)  => api.get('/claims', { params }),
  review:   (id: string, d: any) => api.patch(`/claims/${id}/review`, d),
}

// Payments
export const paymentApi = {
  initiate:       (d: any)              => api.post('/payments/initiate', d),
  confirm:        (id: string, ref: string) => api.post(`/payments/${id}/confirm`, { providerRef: ref }),
  my:             ()                    => api.get('/payments/my'),
  byPolicy:       (policyId: string)    => api.get(`/payments/policy/${policyId}`),
}

// Insurer
export const insurerApi = {
  products:        (params?: any)        => api.get('/insurer/products', { params }),
  getProduct:      (id: string)          => api.get(`/insurer/products/${id}`),
  createProduct:   (d: any)              => api.post('/insurer/products', d),
  updateProduct:   (id: string, d: any)  => api.patch(`/insurer/products/${id}`, d),
  publishProduct:  (id: string)          => api.post(`/insurer/products/${id}/publish`),
  suspendProduct:  (id: string)          => api.post(`/insurer/products/${id}/suspend`),
  addRule:         (id: string, d: any)  => api.post(`/insurer/products/${id}/pricing-rules`, d),
  removeRule:      (ruleId: string)      => api.delete(`/insurer/pricing-rules/${ruleId}`),
  stats:           ()                    => api.get('/insurer/stats'),
}

// Partner
export const partnerApi = {
  list:            ()                    => api.get('/partner'),
  get:             (id: string)          => api.get(`/partner/${id}`),
  create:          (d: any)              => api.post('/partner', d),
  update:          (id: string, d: any)  => api.patch(`/partner/${id}`, d),
  approve:         (id: string)          => api.post(`/partner/${id}/approve`),
  reject:          (id: string, reason?: string) => api.post(`/partner/${id}/reject`, { reason }),
  suspend:         (id: string)          => api.post(`/partner/${id}/suspend`),
  stats:           (id: string)          => api.get(`/partner/${id}/stats`),
  regenKey:        (id: string, env?: 'prod' | 'sandbox') => api.post(`/partner/${id}/regen-key`, { env }),
  payouts:         (id: string)          => api.get(`/partner/${id}/payouts`),
  createPayout:    (id: string, d: any)  => api.post(`/partner/${id}/payouts`, d),
  confirmPayout:   (payoutId: string)    => api.post(`/partner/payouts/${payoutId}/confirm`),
  apiUsage:        (id: string, days = 30) => api.get(`/partner/${id}/api-usage`, { params: { days } }),
  webhookLogs:     (id: string)          => api.get(`/partner/${id}/webhooks`),
}

// Admin
export const adminApi = {
  overview:        ()                    => api.get('/admin/overview'),
  policyTrends:    (days = 30)           => api.get('/admin/analytics/policies/trends', { params: { days } }),
  claimTrends:     (days = 30)           => api.get('/admin/analytics/claims/trends', { params: { days } }),
  snapshots:       (days = 30)           => api.get('/admin/analytics/snapshots', { params: { days } }),
  auditLogs:       (params?: any)        => api.get('/admin/audit-logs', { params }),
  users:           (params?: any)        => api.get('/users', { params }),
  changeRole:      (id: string, role: string) => api.patch(`/users/${id}/role`, { role }),
  toggleUser:      (id: string, isActive: boolean) => api.patch(`/users/${id}/toggle`, { isActive }),
  kycVerify:       (userId: string, approved: boolean) => api.post(`/admin/kyc/${userId}/verify`, { approved }),
  complianceFlags: (params?: any)        => api.get('/admin/compliance/flags', { params }),
  resolveFlag:     (id: string, d: any)  => api.patch(`/admin/compliance/flags/${id}/resolve`, d),
  settings:        ()                    => api.get('/admin/settings'),
  setSetting:      (key: string, value: string) => api.patch(`/admin/settings/${key}`, { value }),
  approvePartner:  (id: string)          => api.post(`/admin/partners/${id}/approve`),
  rejectPartner:   (id: string, reason?: string) => api.post(`/admin/partners/${id}/reject`, { reason }),
  suspendPartner:  (id: string)          => api.post(`/admin/partners/${id}/suspend`),
  createPayout:    (d: any)              => api.post('/admin/payouts', d),
  confirmPayout:   (id: string)          => api.post(`/admin/payouts/${id}/confirm`),
  publishProduct:  (id: string)          => api.post(`/admin/products/${id}/publish`),
  suspendProduct:  (id: string)          => api.post(`/admin/products/${id}/suspend`),
}
