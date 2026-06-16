import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        setUser({ authenticated: true })
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (username, password) => {
    try {
      setError(null)
      await authService.login(username, password)
      setUser({ authenticated: true, username })
      return true
    } catch (err) {
      setError(err)
      return false
    }
  }

  const register = async (username, password) => {
    try {
      setError(null)
      await authService.register(username, password)
      return true
    } catch (err) {
      setError(err)
      return false
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
