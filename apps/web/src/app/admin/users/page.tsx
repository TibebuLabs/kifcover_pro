'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  kycStatus: string
  isActive: boolean
  createdAt: string
}

const kycVariant: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  VERIFIED: 'success',
  IN_PROGRESS: 'warning',
  PENDING: 'neutral',
  REJECTED: 'error',
}

const ROLES = ['CUSTOMER', 'PARTNER_ADMIN', 'PLATFORM_ADMIN', 'INSURANCE_PROVIDER']

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [pendingLoading, setPendingLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const limit = 20

  const loadUsers = () => {
    setLoading(true)
    api.get('/users', { params: { page, limit } })
      .then((res) => { setUsers(res.data.data ?? []); setTotal(res.data.total ?? 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const loadPending = () => {
    setPendingLoading(true)
    api.get('/admin/users/pending')
      .then((res) => { setPendingUsers(Array.isArray(res.data) ? res.data : []) })
      .catch(() => {})
      .finally(() => setPendingLoading(false))
  }

  useEffect(() => { loadUsers(); loadPending() }, [page])

  const handleApprove = async (userId: string) => {
    setApprovingId(userId)
    try {
      await api.post(`/admin/users/${userId}/approve`)
      loadPending()
      loadUsers()
    } catch {}
    setApprovingId(null)
  }

  const handleReject = async (userId: string) => {
    if (!confirm('Are you sure you want to reject this user? They will be removed.')) return
    setApprovingId(userId)
    try {
      await api.post(`/admin/users/${userId}/reject`)
      loadPending()
      loadUsers()
    } catch {}
    setApprovingId(null)
  }

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await api.patch(`/users/${userId}/role`, { role })
      loadUsers()
    } catch {}
  }

  const handleToggle = async (user: User) => {
    try {
      await api.patch(`/users/${user.id}/toggle`, { isActive: !user.isActive })
      loadUsers()
    } catch {}
  }

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(total / limit)

  return (
    <>
      <DashboardHeader title="User Management" subtitle={`${total.toLocaleString()} registered users`} />
      <main className="p-8 flex-1 space-y-6">

          {/* ── Pending Approval Section ────────────────────────────── */}
          {pendingLoading ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-amber-600 text-[22px] animate-spin">progress_activity</span>
                <span className="text-sm font-semibold text-amber-800">Loading pending users...</span>
              </div>
            </div>
          ) : pendingUsers.length > 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-amber-200">
                <span className="material-symbols-outlined text-amber-600 text-[22px]">admin_panel_settings</span>
                <div>
                  <h3 className="font-bold text-amber-900">Pending Approval</h3>
                  <p className="text-xs text-amber-700">{pendingUsers.length} user{pendingUsers.length > 1 ? 's' : ''} waiting for admin activation</p>
                </div>
              </div>
              <div className="divide-y divide-amber-200">
                {pendingUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-6 py-4 hover:bg-amber-100/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-amber-700 text-[18px]">person</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-amber-900">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-amber-700">{u.email}{u.phone ? ` · ${u.phone}` : ''}</p>
                        <p className="text-[11px] text-amber-600 mt-0.5">
                          Role: <span className="font-semibold">{u.role.replace('_', ' ')}</span> · Registered {new Date(u.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(u.id)}
                        disabled={approvingId === u.id}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        {approvingId === u.id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(u.id)}
                        disabled={approvingId === u.id}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-white border border-red-300 text-red-600 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-low border border-border-subtle rounded-2xl p-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-green-600 text-[22px]">check_circle</span>
              <div>
                <p className="font-semibold text-sm text-on-surface">No pending approvals</p>
                <p className="text-xs text-on-surface-variant">All registered users have been activated.</p>
              </div>
            </div>
          )}

          {/* ── All Users Table ─────────────────────────────────────── */}
          <div>
            {/* Search */}
            <div className="relative max-w-sm mb-4">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="bg-white rounded-2xl border border-border-subtle overflow-hidden shadow-card">
              {loading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-surface-container rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-surface-container-low border-b border-border-subtle">
                    <tr>
                      {['Name', 'Email', 'Role', 'KYC', 'Status', 'Joined', 'Actions'].map((h) => (
                        <th key={h} className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id} className="border-b border-border-subtle hover:bg-surface-container-low transition-colors">
                        <td className="px-5 py-3 font-semibold text-primary">{u.firstName} {u.lastName}</td>
                        <td className="px-5 py-3 text-on-surface-variant text-xs">{u.email}</td>
                        <td className="px-5 py-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="text-xs border border-border-subtle rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary/20"
                          >
                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-3"><Badge label={u.kycStatus} variant={kycVariant[u.kycStatus] ?? 'neutral'} dot /></td>
                        <td className="px-5 py-3">
                          <Badge label={u.isActive ? 'Active' : 'Inactive'} variant={u.isActive ? 'success' : 'error'} dot />
                        </td>
                        <td className="px-5 py-3 text-on-surface-variant text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => handleToggle(u)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                              u.isActive
                                ? 'border-error/30 text-error hover:bg-error-container'
                                : 'border-secondary/30 text-secondary hover:bg-secondary-container/20'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle">
                  <p className="text-xs text-on-surface-variant">Page {page} of {totalPages} · {total} users</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 text-xs font-semibold border border-border-subtle rounded-xl disabled:opacity-40 hover:bg-surface-container-low transition-colors"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 text-xs font-semibold border border-border-subtle rounded-xl disabled:opacity-40 hover:bg-surface-container-low transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
      </main>
    </>
  )
}
