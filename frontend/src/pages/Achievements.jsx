import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { formatDate } from '../utils/helpers'

const Achievements = () => {
  const { user } = useAuth()
  const [achievementData, setAchievementData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    total_achievements: 0,
    unlocked_count: 0,
    completion_percentage: 0
  })

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      setLoading(true)
      const response = await api.get('/achievements/')
      
      if (response.data) {
        setAchievementData(response.data.achievement_data || [])
        setStats({
          total_achievements: response.data.total_achievements || 0,
          unlocked_count: response.data.unlocked_count || 0,
          completion_percentage: response.data.total_achievements > 0 
            ? Math.round((response.data.unlocked_count / response.data.total_achievements) * 100)
            : 0
        })
      }
    } catch (err) {
      console.error('Error fetching achievements:', err)
      setError('Failed to load achievements. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const getAchievementTypeIcon = (type) => {
    switch (type) {
      case 'mood_streak':
        return 'fas fa-fire'
      case 'journal_count':
        return 'fas fa-book'
      case 'mood_count':
        return 'fas fa-heart'
      case 'consistency':
        return 'fas fa-calendar-check'
      default:
        return 'fas fa-star'
    }
  }

  const getAchievementTypeTitle = (type) => {
    switch (type) {
      case 'mood_streak':
        return 'Mood Streaks'
      case 'journal_count':
        return 'Journal Entries'
      case 'mood_count':
        return 'Mood Tracking'
      case 'consistency':
        return 'Consistency'
      default:
        return 'Milestones'
    }
  }

  const getRequirementText = (achievement) => {
    switch (achievement.achievement_type) {
      case 'mood_streak':
        return `Track your mood for ${achievement.requirement_value} consecutive days`
      case 'journal_count':
        return `Write ${achievement.requirement_value} journal entries`
      case 'mood_count':
        return `Record ${achievement.requirement_value} mood entries`
      case 'consistency':
        return `Track your mood on ${achievement.requirement_value} different days in a month`
      default:
        return `Complete ${achievement.requirement_value} activities`
    }
  }

  const groupAchievementsByType = (achievements) => {
    const grouped = {}
    achievements.forEach(item => {
      const type = item.achievement.achievement_type
      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push(item)
    })
    return grouped
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading achievements...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    )
  }

  const groupedAchievements = groupAchievementsByType(achievementData)

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="text-center mb-4">
            <h1 className="display-4 fw-bold text-dark mb-3">
              <i className="fas fa-trophy text-warning me-3"></i>
              Achievements
            </h1>
            <p className="lead text-muted">Track your progress and unlock rewards for your mental wellness journey</p>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="row mb-5">
        <div className="col-md-4 mb-3">
          <div className="card text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body text-center py-4">
              <i className="fas fa-trophy fa-2x mb-2"></i>
              <h3>{stats.unlocked_count}</h3>
              <p className="mb-0">Unlocked</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body text-center py-4">
              <i className="fas fa-target fa-2x mb-2"></i>
              <h3>{stats.total_achievements}</h3>
              <p className="mb-0">Total</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body text-center py-4">
              <i className="fas fa-percentage fa-2x mb-2"></i>
              <h3>{stats.completion_percentage}%</h3>
              <p className="mb-0">Complete</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Achievements by Category */}
      {Object.keys(groupedAchievements).length > 0 ? (
        Object.entries(groupedAchievements).map(([type, achievements]) => (
          <div key={type} className="mb-5">
            <div className="mb-4 p-3 rounded" style={{ background: 'linear-gradient(135deg, #7dd3fc 0%, #86efac 100%)', color: '#1e293b' }}>
              <h3 className="mb-0 fw-bold">
                <i className={`${getAchievementTypeIcon(type)} me-2`}></i>
                {getAchievementTypeTitle(type)}
              </h3>
            </div>
            
            <div className="row">
              {achievements.map((data, index) => (
                <div key={index} className="col-lg-4 col-md-6 mb-4">
                  <div className={`card h-100 achievement-card ${
                    data.is_unlocked ? 'achievement-unlocked' : 'achievement-locked'
                  }`} style={{
                    background: data.is_unlocked 
                      ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
                      : 'rgba(255, 255, 255, 0.95)',
                    color: data.is_unlocked ? '#1e293b' : '#64748b',
                    border: 'none',
                    borderRadius: '15px',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}>
                    {data.is_unlocked && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: '#10b981',
                        color: 'white',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem'
                      }}>
                        <i className="fas fa-check"></i>
                      </div>
                    )}
                    
                    <div className="card-body text-center d-flex flex-column">
                      <div className="mb-3" style={{
                        fontSize: '3rem',
                        color: data.is_unlocked ? '#f59e0b' : '#94a3b8'
                      }}>
                        <i className={data.achievement.icon}></i>
                      </div>
                      
                      <h5 className="card-title fw-bold mb-2">{data.achievement.name}</h5>
                      <p className="card-text mb-3 flex-grow-1">{data.achievement.description}</p>
                      
                      {!data.is_unlocked ? (
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted">Progress</small>
                            <small className="text-muted">
                              {data.current_progress}/{data.achievement.requirement_value}
                            </small>
                          </div>
                          <div style={{
                            height: '8px',
                            borderRadius: '4px',
                            background: 'rgba(0, 0, 0, 0.1)',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              background: 'linear-gradient(90deg, #7dd3fc, #86efac)',
                              borderRadius: '4px',
                              width: `${data.progress_percentage}%`,
                              transition: 'width 0.3s ease'
                            }}></div>
                          </div>
                          
                          <div className="mt-3">
                            <small className="text-muted">
                              <strong>Requirement:</strong><br />
                              {getRequirementText(data.achievement)}
                            </small>
                          </div>
                        </div>
                      ) : (
                        <div className="unlocked-info">
                          <div className="badge bg-success mb-2">
                            <i className="fas fa-trophy me-1"></i>
                            {data.achievement.points} Points
                          </div>
                          {data.unlocked_at && (
                            <small className="text-muted d-block">
                              <i className="fas fa-calendar me-1"></i>
                              Unlocked {formatDate(data.unlocked_at)}
                            </small>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-5">
          <i className="fas fa-trophy fa-4x text-muted mb-3"></i>
          <h3 className="text-muted">No Achievements Available</h3>
          <p className="text-muted">Check back later for new achievements to unlock!</p>
        </div>
      )}
      
      {/* Motivational Message */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card text-center text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body py-4">
              <h4 className="mb-3">
                <i className="fas fa-star me-2"></i>
                Keep Going!
              </h4>
              <p className="mb-0 lead">
                Every mood entry and journal post brings you closer to your next achievement. 
                Your mental wellness journey matters!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Achievements