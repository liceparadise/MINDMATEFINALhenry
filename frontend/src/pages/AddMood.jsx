import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { moodOptions } from '../utils/helpers'

const AddMood = () => {
  const [selectedMood, setSelectedMood] = useState(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const navigate = useNavigate()

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedMood) {
      setError('Please select a mood level')
      return
    }

    setLoading(true)
    setError('')

    try {
      const moodData = {
        mood_level: selectedMood.value,
        notes: notes.trim() || null
      }

      await api.post('/mood-entries/', moodData)
      setSuccess(true)
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
      
    } catch (err) {
      console.error('Error saving mood:', err)
      setError(err.response?.data?.error || 'Failed to save mood entry')
    } finally {
      setLoading(false)
    }
  }

  const handleAddJournal = () => {
    if (selectedMood) {
      navigate(`/add-journal/${selectedMood.value}`)
    }
  }

  if (success) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="success-container fade-in">
              <i className="fas fa-check-circle fa-4x text-success mb-4"></i>
              <h2>Mood Saved Successfully!</h2>
              <p className="text-muted mb-4">
                Your mood entry has been recorded. Keep up the great work!
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <Link to="/dashboard" className="btn btn-primary">
                  <i className="fas fa-home me-2"></i>
                  Back to Dashboard
                </Link>
                <button 
                  className="btn btn-outline-primary" 
                  onClick={handleAddJournal}
                >
                  <i className="fas fa-pen me-2"></i>
                  Add Journal Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="form-card fade-in">
            <div className="text-center mb-4">
              <i className="fas fa-heart fa-3x text-primary mb-3"></i>
              <h2 className="fw-bold">How are you feeling?</h2>
              <p className="text-muted">
                Take a moment to check in with yourself and track your current mood.
              </p>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Mood Selection */}
              <div className="mb-4">
                <label className="form-label h5 mb-3">
                  <i className="fas fa-smile me-2"></i>
                  Select your mood level:
                </label>
                <div className="mood-selector">
                  {moodOptions.map((mood) => (
                    <div
                      key={mood.value}
                      className={`mood-option ${
                        selectedMood?.value === mood.value ? 'selected' : ''
                      }`}
                      onClick={() => handleMoodSelect(mood)}
                      style={{
                        borderColor: selectedMood?.value === mood.value ? mood.color : 'transparent'
                      }}
                    >
                      <div className="mood-emoji-large">{mood.emoji}</div>
                      <div className="fw-bold">{mood.label}</div>
                      <div className="text-muted small">Level {mood.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes Section */}
              <div className="mb-4">
                <label htmlFor="notes" className="form-label h6">
                  <i className="fas fa-sticky-note me-2"></i>
                  Notes (Optional)
                </label>
                <textarea
                  className="form-control"
                  id="notes"
                  name="notes"
                  rows="4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What's on your mind? Share any thoughts, feelings, or events that influenced your mood..."
                  disabled={loading}
                  maxLength={500}
                />
                <div className="form-text">
                  {notes.length}/500 characters
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-3 justify-content-center">
                <Link 
                  to="/dashboard" 
                  className="btn btn-outline-secondary"
                  disabled={loading}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={loading || !selectedMood}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Save Mood
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Mood Tips */}
            <div className="mt-5 p-4 bg-light rounded">
              <h6 className="fw-bold mb-3">
                <i className="fas fa-lightbulb me-2 text-warning"></i>
                Mood Tracking Tips
              </h6>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Be honest about how you're really feeling
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Track your mood at the same time each day for consistency
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Include notes about what might have influenced your mood
                </li>
                <li className="mb-0">
                  <i className="fas fa-check text-success me-2"></i>
                  Look for patterns over time to better understand yourself
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddMood