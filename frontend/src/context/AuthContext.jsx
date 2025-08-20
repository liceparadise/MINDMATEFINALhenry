import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        // Set the token in the API headers
        api.defaults.headers.common['Authorization'] = `Token ${token}`
        
        // Verify the token with the backend
        const response = await api.get('/auth/user/')
        setUser(response.data)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login/', {
        username,
        password
      })
      
      const { token, user } = response.data
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Token ${token}`
      
      setUser(user)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      }
    }
  }

  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/signup/', userData)
      
      const { token, user } = response.data
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Token ${token}`
      
      setUser(user)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (error) {
      console.error('Signup failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || 'Signup failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    updateUser,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}