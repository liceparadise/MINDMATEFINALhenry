import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { formatDate, validateEmail } from '../utils/helpers'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: ''
  })
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || ''
      })
    }
    fetchUserStats()
  }, [user])

  const fetchUserStats = async () => {
    try {
      const [moodResponse, journalResponse] = await Promise.all([
        api.get('/mood-entries/'),
        api.get('/journals/')
      ])
      
      const moodEntries = moodResponse.data.results || moodResponse.data
      const journals = journalResponse.data.results || journalResponse.data
      
      setStats({
        totalMoodEntries: moodEntries.length,
        totalJournals: journals.length,
        joinDate: user?.date_joined,
        lastMoodEntry: moodEntries.length > 0 ? moodEntries[0].created_at : null,
        lastJournal: journals.length > 0 ? journals[0].created_at : null
      })
    } catch (err) {
      console.error('Error fetching user stats:', err)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
    if (passwordError) setPasswordError('')
    if (passwordSuccess) setPasswordSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.username.trim()) {
      setError('Username is required')
      return
    }
    
    if (!formData.email.trim()) {
      setError('Email is required')
      return
    }
    
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await api.patch(`/users/${user.id}/`, {
        username: formData.username.trim(),
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        bio: formData.bio.trim()
      })
      
      updateUser(response.data)
      setSuccess('Profile updated successfully!')
      
    } catch (err) {
      console.error('Error updating profile:', err)
      if (err.response?.data) {
        const errors = err.response.data
        if (errors.username) {
          setError(`Username: ${errors.username[0]}`)
        } else if (errors.email) {
          setError(`Email: ${errors.email[0]}`)
        } else {
          setError('Failed to update profile. Please try again.')
        }
      } else {
        setError('Failed to update profile. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!passwordData.current_password) {
      setPasswordError('Current password is required')
      return
    }
    
    if (!passwordData.new_password) {
      setPasswordError('New password is required')
      return
    }
    
    if (passwordData.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters long')
      return
    }
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match')
      return
    }

    setPasswordLoading(true)
    setPasswordError('')
    setPasswordSuccess('')

    try {
      await api.post('/auth/change-password/', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })
      
      setPasswordSuccess('Password changed successfully!')
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
      
    } catch (err) {
      console.error('Error changing password:', err)
      if (err.response?.data?.error) {
        setPasswordError(err.response.data.error)
      } else {
        setPasswordError('Failed to change password. Please try again.')
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    return user?.username?.[0]?.toUpperCase() || 'U'
  }

  return (
    <div className="container py-5">
      <div className="row">
        {/* Profile Header */}
        <div className="col-12 mb-4">
          <div className="profile-header text-center">
            <div className="profile-avatar mx-auto mb-3">
              {user?.profile_picture ? (
                <img 
                  src={user.profile_picture} 
                  alt="Profile Picture" 
                  className="rounded-circle" 
                  style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                />
              ) : (
                getInitials()
              )}
            </div>
            <h2 className="fw-bold">
              {user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}` 
                : user?.username
              }
            </h2>
            <p className="text-muted">@{user?.username}</p>
            {user?.bio && (
              <p className="lead">{user.bio}</p>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="col-12 mb-4">
            <div className="row g-3">
              <div className="col-md-3">
                <div className="stat-card text-center">
                  <i className="fas fa-smile fa-2x text-primary mb-2"></i>
                  <h4 className="fw-bold">{stats.totalMoodEntries}</h4>
                  <p className="text-muted mb-0">Mood Entries</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card text-center">
                  <i className="fas fa-book fa-2x text-success mb-2"></i>
                  <h4 className="fw-bold">{stats.totalJournals}</h4>
                  <p className="text-muted mb-0">Journal Entries</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card text-center">
                  <i className="fas fa-calendar fa-2x text-info mb-2"></i>
                  <h4 className="fw-bold">
                    {stats.joinDate ? formatDate(stats.joinDate) : 'N/A'}
                  </h4>
                  <p className="text-muted mb-0">Member Since</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card text-center">
                  <i className="fas fa-clock fa-2x text-warning mb-2"></i>
                  <h4 className="fw-bold">
                    {stats.lastMoodEntry ? formatDate(stats.lastMoodEntry) : 'Never'}
                  </h4>
                  <p className="text-muted mb-0">Last Activity</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="col-12">
          <ul className="nav nav-tabs mb-4" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
                type="button"
              >
                <i className="fas fa-user me-2"></i>
                Profile Information
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
                type="button"
              >
                <i className="fas fa-lock me-2"></i>
                Change Password
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="tab-pane fade show active">
                <div className="row justify-content-center">
                  <div className="col-lg-8">
                    <div className="form-card">
                      <h4 className="fw-bold mb-4">
                        <i className="fas fa-edit me-2"></i>
                        Edit Profile
                      </h4>

                      {error && (
                        <div className="alert alert-danger" role="alert">
                          <i className="fas fa-exclamation-circle me-2"></i>
                          {error}
                        </div>
                      )}

                      {success && (
                        <div className="alert alert-success" role="alert">
                          <i className="fas fa-check-circle me-2"></i>
                          {success}
                        </div>
                      )}

                      <form onSubmit={handleSubmit}>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="username" className="form-label">
                              Username *
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="username"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              disabled={loading}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="email" className="form-label">
                              Email *
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              disabled={loading}
                              required
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="first_name" className="form-label">
                              First Name
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="first_name"
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleChange}
                              disabled={loading}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="last_name" className="form-label">
                              Last Name
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="last_name"
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleChange}
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="bio" className="form-label">
                            Bio
                          </label>
                          <textarea
                            className="form-control"
                            id="bio"
                            name="bio"
                            rows="3"
                            value={formData.bio}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="Tell us a little about yourself..."
                            maxLength={500}
                          />
                          <div className="form-text">
                            {formData.bio.length}/500 characters
                          </div>
                        </div>

                        <div className="text-center">
                          <button
                            type="submit"
                            className="btn btn-primary px-4"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Updating...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-save me-2"></i>
                                Update Profile
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="tab-pane fade show active">
                <div className="row justify-content-center">
                  <div className="col-lg-6">
                    <div className="form-card">
                      <h4 className="fw-bold mb-4">
                        <i className="fas fa-key me-2"></i>
                        Change Password
                      </h4>

                      {passwordError && (
                        <div className="alert alert-danger" role="alert">
                          <i className="fas fa-exclamation-circle me-2"></i>
                          {passwordError}
                        </div>
                      )}

                      {passwordSuccess && (
                        <div className="alert alert-success" role="alert">
                          <i className="fas fa-check-circle me-2"></i>
                          {passwordSuccess}
                        </div>
                      )}

                      <form onSubmit={handlePasswordSubmit}>
                        <div className="mb-3">
                          <label htmlFor="current_password" className="form-label">
                            Current Password *
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="current_password"
                            name="current_password"
                            value={passwordData.current_password}
                            onChange={handlePasswordChange}
                            disabled={passwordLoading}
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="new_password" className="form-label">
                            New Password *
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="new_password"
                            name="new_password"
                            value={passwordData.new_password}
                            onChange={handlePasswordChange}
                            disabled={passwordLoading}
                            required
                            minLength={8}
                          />
                          <div className="form-text">
                            Password must be at least 8 characters long
                          </div>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="confirm_password" className="form-label">
                            Confirm New Password *
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="confirm_password"
                            name="confirm_password"
                            value={passwordData.confirm_password}
                            onChange={handlePasswordChange}
                            disabled={passwordLoading}
                            required
                          />
                        </div>

                        <div className="text-center">
                          <button
                            type="submit"
                            className="btn btn-primary px-4"
                            disabled={passwordLoading}
                          >
                            {passwordLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Changing...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-lock me-2"></i>
                                Change Password
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile