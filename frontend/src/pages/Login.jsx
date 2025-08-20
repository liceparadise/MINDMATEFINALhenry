import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await login(formData.username, formData.password)
      
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="form-card fade-in">
            <div className="text-center mb-4">
              <i className="fas fa-brain fa-3x text-primary mb-3"></i>
              <h2 className="fw-bold">Welcome Back</h2>
              <p className="text-muted">Sign in to continue your mental health journey</p>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  <i className="fas fa-user me-2"></i>
                  Username
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter your username"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label">
                  <i className="fas fa-lock me-2"></i>
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Signing In...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-muted mb-0">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary text-decoration-none fw-bold">
                  Sign up here
                </Link>
              </p>
            </div>

            {/* Demo Mode Notice */}
            <div className="mt-4 p-3 bg-light rounded">
              <div className="text-center">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Demo Mode: You can create an account or use demo credentials
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login