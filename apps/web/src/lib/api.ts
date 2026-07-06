import axios from 'axios'
import Cookies from 'js-cookie'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('kif_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 from a protected endpoint, clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.includes('/auth/')
    if (err.response?.status === 401 && !isAuthEndpoint && typeof window !== 'undefined') {
      Cookies.remove('kif_token')
      // Clear zustand store
      try {
        const store = JSON.parse(localStorage.getItem('kif-auth') || '{}')
        if (store.state) { store.state.user = null; store.state.token = null }
        localStorage.setItem('kif-auth', JSON.stringify(store))
      } catch {}
      window.location.href = '/auth/login'
    }
    return Promise.reject(err)
  }
)
