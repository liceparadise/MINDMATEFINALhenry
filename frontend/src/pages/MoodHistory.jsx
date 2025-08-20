import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import api from '../utils/api'
import { formatDate, getMoodEmoji, getMoodLabel, getMoodColor, generateChartColors } from '../utils/helpers'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const MoodHistory = () => {
  const [moodHistory, setMoodHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState('30') // days
  const [chartType, setChartType] = useState('line')

  useEffect(() => {
    fetchMoodHistory()
  }, [timeRange])

  const fetchMoodHistory = async () => {
    try {
      setLoading(true)
      
      // Fetch mood history
      const historyResponse = await api.get(`/mood-entries/mood_history/?days=${timeRange}`)
      setMoodHistory(historyResponse.data)
      
      // Fetch mood statistics
      const statsResponse = await api.get('/mood-entries/mood_stats/')
      setStats(statsResponse.data)
      
    } catch (err) {
      console.error('Error fetching mood history:', err)
      setError('Failed to load mood history')
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    try {
      const response = await api.get('/mood-entries/export_data/', {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `mood_data_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting data:', err)
      alert('Failed to export data')
    }
  }

  // Prepare chart data
  const prepareLineChartData = () => {
    const labels = moodHistory.map(entry => formatDate(entry.date))
    const data = moodHistory.map(entry => entry.average_mood)
    
    return {
      labels,
      datasets: [
        {
          label: 'Average Mood',
          data,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointStyle: data.map(moodLevel => {
            if (moodLevel >= 4.5) return '😄';
            if (moodLevel >= 3.5) return '😊';
            if (moodLevel >= 2.5) return '😐';
            if (moodLevel >= 1.5) return '😞';
            return '😢';
          }),
          pointRadius: 12,
          pointHoverRadius: 15,
        },
      ],
    }
  }

  const prepareBarChartData = () => {
    const moodCounts = [1, 2, 3, 4, 5].map(level => {
      return moodHistory.reduce((count, entry) => {
        return count + (entry.mood_entries?.filter(mood => mood.mood_level === level).length || 0)
      }, 0)
    })

    return {
      labels: ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'],
      datasets: [
        {
          label: 'Mood Count',
          data: moodCounts,
          backgroundColor: [
            '#e74c3c',
            '#f39c12',
            '#95a5a6',
            '#2ecc71',
            '#27ae60'
          ],
          borderColor: [
            '#c0392b',
            '#e67e22',
            '#7f8c8d',
            '#27ae60',
            '#229954'
          ],
          borderWidth: 2,
        },
      ],
    }
  }

  const prepareDoughnutChartData = () => {
    const moodCounts = [1, 2, 3, 4, 5].map(level => {
      return moodHistory.reduce((count, entry) => {
        return count + (entry.mood_entries?.filter(mood => mood.mood_level === level).length || 0)
      }, 0)
    })

    return {
      labels: ['😢 Very Sad', '😞 Sad', '😐 Neutral', '😊 Happy', '😄 Very Happy'],
      datasets: [
        {
          data: moodCounts,
          backgroundColor: [
            '#e74c3c',
            '#f39c12',
            '#95a5a6',
            '#2ecc71',
            '#27ae60'
          ],
          borderColor: '#fff',
          borderWidth: 3,
        },
      ],
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Mood Trends - Last ${timeRange} Days`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: chartType !== 'doughnut' ? {
      y: {
        beginAtZero: true,
        max: chartType === 'line' ? 5 : undefined,
        ticks: {
          stepSize: chartType === 'line' ? 1 : undefined,
          callback: function(value) {
            if (chartType === 'line') {
              return getMoodLabel(value)
            }
            return value
          }
        }
      },
    } : undefined,
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
        <button className="btn btn-primary" onClick={fetchMoodHistory}>
          <i className="fas fa-redo me-2"></i>
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="container py-4 fade-in">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h1 className="h2 mb-2">
                <i className="fas fa-chart-line me-2"></i>
                Mood History & Analytics
              </h1>
              <p className="text-muted">
                Track your emotional journey and discover patterns in your mental health.
              </p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button className="btn btn-outline-primary" onClick={exportData}>
                <i className="fas fa-download me-2"></i>
                Export Data
              </button>
              <Link to="/add-mood" className="btn btn-primary">
                <i className="fas fa-plus me-2"></i>
                Add Mood
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <i className="fas fa-heart fa-2x text-primary mb-2"></i>
                <h3 className="h4 mb-1">{stats.total_entries}</h3>
                <p className="text-muted mb-0">Total Entries</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <i className="fas fa-smile fa-2x text-success mb-2"></i>
                <h3 className="h4 mb-1">
                  {stats.average_mood ? stats.average_mood.toFixed(1) : 'N/A'}
                </h3>
                <p className="text-muted mb-0">Average Mood</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <i className="fas fa-fire fa-2x text-warning mb-2"></i>
                <h3 className="h4 mb-1">{stats.streak}</h3>
                <p className="text-muted mb-0">Day Streak</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <i className="fas fa-trophy fa-2x text-info mb-2"></i>
                <h3 className="h4 mb-1">
                  {stats.most_common_mood ? getMoodEmoji(stats.most_common_mood) : '😐'}
                </h3>
                <p className="text-muted mb-0">Most Common</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Controls */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Time Range:</label>
                  <select 
                    className="form-select"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 3 months</option>
                    <option value="365">Last year</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Chart Type:</label>
                  <select 
                    className="form-select"
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                  >
                    <option value="line">Line Chart</option>
                    <option value="bar">Bar Chart</option>
                    <option value="doughnut">Doughnut Chart</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="chart-wrapper">
            <div className="chart-container">
              {moodHistory.length > 0 ? (
                <>
                  {chartType === 'line' && (
                    <Line data={prepareLineChartData()} options={chartOptions} />
                  )}
                  {chartType === 'bar' && (
                    <Bar data={prepareBarChartData()} options={chartOptions} />
                  )}
                  {chartType === 'doughnut' && (
                    <Doughnut data={prepareDoughnutChartData()} options={chartOptions} />
                  )}
                </>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-chart-line fa-4x text-muted mb-3"></i>
                  <h4>No Data Available</h4>
                  <p className="text-muted mb-3">
                    Start tracking your mood to see beautiful analytics here.
                  </p>
                  <Link to="/add-mood" className="btn btn-primary">
                    <i className="fas fa-plus me-2"></i>
                    Add Your First Mood
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      {moodHistory.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-history me-2"></i>
                  Recent Mood Entries
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Mood</th>
                        <th>Level</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moodHistory.slice(0, 10).map((entry) => 
                        entry.mood_entries?.map((mood) => (
                          <tr key={mood.id}>
                            <td>{formatDate(mood.created_at)}</td>
                            <td>
                              <span className="me-2">{getMoodEmoji(mood.mood_level)}</span>
                              {getMoodLabel(mood.mood_level)}
                            </td>
                            <td>
                              <span className="badge" style={{ backgroundColor: getMoodColor(mood.mood_level) }}>
                                {mood.mood_level}/5
                              </span>
                            </td>
                            <td>
                              {mood.notes ? (
                                <span className="text-muted">
                                  {mood.notes.length > 50 
                                    ? `${mood.notes.substring(0, 50)}...` 
                                    : mood.notes}
                                </span>
                              ) : (
                                <span className="text-muted fst-italic">No notes</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MoodHistory