import { apiRequest } from './client'

export const authApi = {
  async register(email, password) {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (data?.accessToken) {
      localStorage.setItem('gymx_token', data.accessToken)
      localStorage.setItem('gymx_user', JSON.stringify({
        id: data.id,
        email: data.email,
        userName: data.userName,
      }))
    }
    return data
  },

  async login(email, password) {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (data?.accessToken) {
      localStorage.setItem('gymx_token', data.accessToken)
      localStorage.setItem('gymx_user', JSON.stringify({
        id: data.id,
        email: data.email,
        userName: data.userName,
      }))
    }
    return data
  },

  async getCurrentUser() {
    return apiRequest('/api/users/me')
  },

  logout() {
    localStorage.removeItem('gymx_token')
    localStorage.removeItem('gymx_user')
  },

  getStoredToken() {
    return localStorage.getItem('gymx_token')
  },

  getStoredUser() {
    try {
      const raw = localStorage.getItem('gymx_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
}
