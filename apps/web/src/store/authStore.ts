import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

interface User {
  id: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  role: string
  kycStatus: string
  isActive?: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => {
        Cookies.set('kif_token', token, {
          expires: 7,
          secure: false,
          sameSite: 'lax',
        })
        set({ token })
      },
      logout: () => {
        Cookies.remove('kif_token')
        set({ user: null, token: null })
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
      },
      isAuthenticated: () => !!get().token && !!get().user,
    }),
    {
      name: 'kif-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
