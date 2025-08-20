import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './Loading'

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (loading) {
    return <Loading fullScreen text="Checking authentication..." />
  }

  // If route requires authentication but user is not logged in
  if (requireAuth && !user) {
    // Save the attempted location for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If route doesn't require authentication but user is logged in
  // (e.g., login/signup pages when already authenticated)
  if (!requireAuth && user) {
    // Redirect to dashboard or the intended destination
    const from = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={from} replace />
  }

  // Render the protected component
  return children
}

export default ProtectedRoute