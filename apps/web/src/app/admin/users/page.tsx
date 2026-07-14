'use client'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
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
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionUser, setActionUser] = useState<User | null>(null)
  const [search, setSearch] = useState('')
  const limit = 20

  const loadUsers = () => {
    setLoading(true)
    api.get('/users', { params: { page, limit } })
      .then((res) => { setUsers(res.data.data ?? []); setTotal(res.data.total ?? 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadUsers() }, [page])

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
    <div className="flex min-h-screen bg-background-main">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <DashboardHeader title="User Management" subtitle={`${total.toLocaleString()} registered users`} />
        <main className="p-8 flex-1 space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
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
        </main>
      </div>
    </div>
  )
}
