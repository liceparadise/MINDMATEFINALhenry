import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import { getMoodEmoji, getMoodLabel } from '../utils/helpers'

const AddJournal = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood_entry: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [moodEntry, setMoodEntry] = useState(null)
  
  const navigate = useNavigate()
  const { moodId } = useParams()

  useEffect(() => {
    if (moodId) {
      fetchMoodEntry(moodId)
    }
  }, [moodId])

  const fetchMoodEntry = async (id) => {
    try {
      const response = await api.get(`/mood-entries/${id}/`)
      setMoodEntry(response.data)
      setFormData(prev => ({
        ...prev,
        mood_entry: id,
        title: `Journal Entry - ${getMoodLabel(response.data.mood_level)}`
      }))
    } catch (err) {
      console.error('Error fetching mood entry:', err)
    }
  }

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
    
    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a title for your journal entry')
      return
    }
    
    if (!formData.content.trim()) {
      setError('Please write some content for your journal entry')
      return
    }

    setLoading(true)
    setError('')

    try {
      const journalData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        mood_entry: formData.mood_entry || null
      }

      await api.post('/journals/', journalData)
      setSuccess(true)
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/journals')
      }, 1500)
      
    } catch (err) {
      console.error('Error saving journal:', err)
      setError(err.response?.data?.error || 'Failed to save journal entry')
    } finally {
      setLoading(false)
    }
  }

  const generateTitle = () => {
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
    
    if (moodEntry) {
      return `${dateStr} - ${getMoodLabel(moodEntry.mood_level)} Day`
    }
    
    return `Journal Entry - ${dateStr}`
  }

  const fillSampleTitle = () => {
    setFormData({
      ...formData,
      title: generateTitle()
    })
  }

  if (success) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="success-container fade-in">
              <i className="fas fa-check-circle fa-4x text-success mb-4"></i>
              <h2>Journal Entry Saved!</h2>
              <p className="text-muted mb-4">
                Your thoughts have been safely recorded. Thank you for taking time to reflect.
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <Link to="/journals" className="btn btn-primary">
                  <i className="fas fa-book me-2"></i>
                  View All Journals
                </Link>
                <Link to="/dashboard" className="btn btn-outline-primary">
                  <i className="fas fa-home me-2"></i>
                  Back to Dashboard
                </Link>
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
              <i className="fas fa-pen fa-3x text-primary mb-3"></i>
              <h2 className="fw-bold">Write Journal Entry</h2>
              <p className="text-muted">
                Express your thoughts, feelings, and reflections in your personal journal.
              </p>
            </div>

            {/* Mood Context */}
            {moodEntry && (
              <div className="alert alert-info" role="alert">
                <div className="d-flex align-items-center">
                  <span className="mood-emoji me-3">
                    {getMoodEmoji(moodEntry.mood_level)}
                  </span>
                  <div>
                    <strong>Writing about your {getMoodLabel(moodEntry.mood_level).toLowerCase()} mood</strong>
                    <br />
                    <small className="text-muted">
                      This journal entry will be linked to your mood entry from today.
                    </small>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="mb-4">
                <label htmlFor="title" className="form-label h6">
                  <i className="fas fa-heading me-2"></i>
                  Title
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Give your journal entry a title..."
                    disabled={loading}
                    maxLength={200}
                  />
                  <button 
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={fillSampleTitle}
                    disabled={loading}
                    title="Generate a title based on today's date"
                  >
                    <i className="fas fa-magic"></i>
                  </button>
                </div>
                <div className="form-text">
                  {formData.title.length}/200 characters
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <label htmlFor="content" className="form-label h6">
                  <i className="fas fa-edit me-2"></i>
                  Your Thoughts
                </label>
                <textarea
                  className="form-control"
                  id="content"
                  name="content"
                  rows="12"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="What's on your mind today? Write about your feelings, experiences, thoughts, or anything you'd like to remember..."
                  disabled={loading}
                  maxLength={5000}
                />
                <div className="form-text">
                  {formData.content.length}/5000 characters
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-3 justify-content-center">
                <Link 
                  to={moodId ? '/dashboard' : '/journals'} 
                  className="btn btn-outline-secondary"
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={loading || !formData.title.trim() || !formData.content.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Save Journal Entry
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Writing Tips */}
            <div className="mt-5 p-4 bg-light rounded">
              <h6 className="fw-bold mb-3">
                <i className="fas fa-lightbulb me-2 text-warning"></i>
                Journaling Tips
              </h6>
              <div className="row">
                <div className="col-md-6">
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      Write freely without worrying about grammar
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      Be honest about your feelings
                    </li>
                    <li className="mb-0">
                      <i className="fas fa-check text-success me-2"></i>
                      Include specific details about your day
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      Reflect on what you're grateful for
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      Note any patterns in your thoughts
                    </li>
                    <li className="mb-0">
                      <i className="fas fa-check text-success me-2"></i>
                      Set intentions for tomorrow
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddJournal