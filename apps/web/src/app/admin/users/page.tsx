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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 20

  useEffect(() => {
    setLoading(true)
    api.get('/users', { params: { page, limit } })
      .then((res) => { setUsers(res.data.users); setTotal(res.data.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex min-h-screen bg-background-main">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <DashboardHeader title="User Management" subtitle={`${total.toLocaleString()} registered users`} />
        <main className="p-8 flex-1">
          <div className="bg-white rounded-2xl border border-border-subtle overflow-hidden shadow-card">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="h-12 bg-surface-container rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-surface-container-low border-b border-border-subtle">
                  <tr>
                    {['Name', 'Email', 'Role', 'KYC', 'Status', 'Joined'].map((h) => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border-subtle hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4 font-semibold text-primary">{u.firstName} {u.lastName}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{u.email}</td>
                      <td className="px-6 py-4"><Badge label={u.role} variant="info" /></td>
                      <td className="px-6 py-4"><Badge label={u.kycStatus} variant={kycVariant[u.kycStatus] ?? 'neutral'} dot /></td>
                      <td className="px-6 py-4">
                        <Badge label={u.isActive ? 'Active' : 'Inactive'} variant={u.isActive ? 'success' : 'error'} dot />
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle">
                <p className="text-xs text-on-surface-variant">
                  Page {page} of {totalPages} · {total} users
                </p>
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
