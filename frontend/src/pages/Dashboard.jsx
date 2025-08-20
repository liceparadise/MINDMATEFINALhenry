import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { formatDate, getMoodEmoji, getMoodLabel } from '../utils/helpers'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentMoods, setRecentMoods] = useState([])
  const [recentJournals, setRecentJournals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch mood statistics
      const statsResponse = await api.get('/mood-entries/mood_stats/')
      setStats(statsResponse.data)
      
      // Fetch recent mood entries
      const moodsResponse = await api.get('/mood-entries/recent/')
      setRecentMoods(moodsResponse.data.results || [])
      
      // Fetch recent journal entries
      const journalsResponse = await api.get('/journals/?limit=3')
      setRecentJournals(journalsResponse.data.results || [])
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          <i className="fas fa-redo me-2"></i>
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="container py-4 fade-in">
      {/* Welcome Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 bg-gradient">
            <div className="card-body p-4">
              <h1 className="h2 mb-2">
                {getGreeting()}, {user?.first_name || user?.username}! 👋
              </h1>
              <p className="text-muted mb-3">
                Welcome back to your mental health dashboard. How are you feeling today?
              </p>
              <Link to="/add-mood" className="btn btn-primary">
                <i className="fas fa-plus-circle me-2"></i>
                Track Your Mood
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <i className="fas fa-heart fa-2x text-primary mb-2"></i>
              <h3 className="h4 mb-1">{stats?.total_entries || 0}</h3>
              <p className="text-muted mb-0">Total Moods</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <i className="fas fa-chart-line fa-2x text-success mb-2"></i>
              <h3 className="h4 mb-1">{stats?.streak || 0}</h3>
              <p className="text-muted mb-0">Day Streak</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <i className="fas fa-smile fa-2x text-warning mb-2"></i>
              <h3 className="h4 mb-1">
                {stats?.average_mood ? stats.average_mood.toFixed(1) : 'N/A'}
              </h3>
              <p className="text-muted mb-0">Avg Mood</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <i className="fas fa-book fa-2x text-info mb-2"></i>
              <h3 className="h4 mb-1">{recentJournals.length}</h3>
              <p className="text-muted mb-0">Recent Journals</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Recent Moods */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-heart me-2"></i>
                Recent Moods
              </h5>
              <Link to="/mood-history" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            <div className="card-body">
              {recentMoods.length > 0 ? (
                <div className="list-group list-group-flush">
                  {recentMoods.map((mood) => (
                    <div key={mood.id} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <span className="mood-emoji me-3">
                            {getMoodEmoji(mood.mood_level)}
                          </span>
                          <div>
                            <h6 className="mb-1">{getMoodLabel(mood.mood_level)}</h6>
                            <small className="text-muted">
                              {formatDate(mood.created_at)}
                            </small>
                          </div>
                        </div>
                        {mood.notes && (
                          <small className="text-muted">
                            <i className="fas fa-sticky-note"></i>
                          </small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-heart fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No mood entries yet</p>
                  <Link to="/add-mood" className="btn btn-primary btn-sm">
                    Add Your First Mood
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Journals */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-book me-2"></i>
                Recent Journals
              </h5>
              <Link to="/journals" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            <div className="card-body">
              {recentJournals.length > 0 ? (
                <div className="list-group list-group-flush">
                  {recentJournals.map((journal) => (
                    <div key={journal.id} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{journal.title}</h6>
                          <p className="mb-1 text-muted">
                            {journal.content.length > 100
                              ? `${journal.content.substring(0, 100)}...`
                              : journal.content}
                          </p>
                          <small className="text-muted">
                            {formatDate(journal.created_at)}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-book fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No journal entries yet</p>
                  <Link to="/add-journal" className="btn btn-primary btn-sm">
                    Write Your First Entry
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3 col-sm-6">
                  <Link to="/add-mood" className="btn btn-outline-primary w-100">
                    <i className="fas fa-plus-circle me-2"></i>
                    Track Mood
                  </Link>
                </div>
                <div className="col-md-3 col-sm-6">
                  <Link to="/add-journal" className="btn btn-outline-success w-100">
                    <i className="fas fa-pen me-2"></i>
                    Write Journal
                  </Link>
                </div>
                <div className="col-md-3 col-sm-6">
                  <Link to="/mood-history" className="btn btn-outline-info w-100">
                    <i className="fas fa-chart-line me-2"></i>
                    View Analytics
                  </Link>
                </div>
                <div className="col-md-3 col-sm-6">
                  <Link to="/profile" className="btn btn-outline-warning w-100">
                    <i className="fas fa-user me-2"></i>
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard