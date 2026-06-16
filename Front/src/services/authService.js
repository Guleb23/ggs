import apiClient from './api'

export const authService = {
  register: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/register', { username, password })
      return response.data
    } catch (error) {
      throw error.response?.data || 'Registration failed'
    }
  },

  login: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', { username, password })
      const { accessToken, refreshToken } = response.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      return response.data
    } catch (error) {
      throw error.response?.data || 'Login failed'
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken')
  },

  getToken: () => {
    return localStorage.getItem('accessToken')
  }
}
