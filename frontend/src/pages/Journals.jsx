import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { formatDateTime, getMoodEmoji, getMoodLabel } from '../utils/helpers'

const Journals = () => {
  const [journals, setJournals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 6

  useEffect(() => {
    fetchJournals()
  }, [currentPage, sortBy])

  useEffect(() => {
    // Reset to first page when search term changes
    if (currentPage !== 1) {
      setCurrentPage(1)
    } else {
      fetchJournals()
    }
  }, [searchTerm])

  const fetchJournals = async () => {
    try {
      setLoading(true)
      
      const params = {
        page: currentPage,
        page_size: itemsPerPage,
        search: searchTerm,
        ordering: sortBy === 'newest' ? '-created_at' : 'created_at'
      }
      
      const response = await api.get('/journals/', { params })
      setJournals(response.data.results || [])
      setTotalPages(Math.ceil(response.data.count / itemsPerPage))
      
    } catch (err) {
      console.error('Error fetching journals:', err)
      setError('Failed to load journal entries')
    } finally {
      setLoading(false)
    }
  }

  const deleteJournal = async (journalId) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) {
      return
    }

    try {
      await api.delete(`/journals/${journalId}/`)
      setJournals(journals.filter(journal => journal.id !== journalId))
    } catch (err) {
      console.error('Error deleting journal:', err)
      alert('Failed to delete journal entry')
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>
      )
    }

    return (
      <nav aria-label="Journal pagination">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
          </li>
          {pages}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    )
  }

  if (loading && journals.length === 0) {
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
        <button className="btn btn-primary" onClick={fetchJournals}>
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
                <i className="fas fa-book me-2"></i>
                My Journal Entries
              </h1>
              <p className="text-muted">
                Reflect on your thoughts and track your mental health journey.
              </p>
            </div>
            <Link to="/add-journal" className="btn btn-primary">
              <i className="fas fa-pen me-2"></i>
              Write New Entry
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search journal entries..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <select 
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Journal Entries */}
      {journals.length > 0 ? (
        <>
          <div className="row">
            {journals.map((journal) => (
              <div key={journal.id} className="col-lg-6 mb-4">
                <div className="journal-entry h-100">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1">
                      <h5 className="mb-1">{journal.title}</h5>
                      <div className="journal-meta">
                        <i className="fas fa-calendar me-1"></i>
                        {formatDateTime(journal.created_at)}
                        {journal.mood_entry && (
                          <span className="ms-3">
                            <span className="me-1">
                              {getMoodEmoji(journal.mood_entry.mood_level)}
                            </span>
                            {getMoodLabel(journal.mood_entry.mood_level)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="dropdown">
                      <button 
                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <button 
                            className="dropdown-item text-danger"
                            onClick={() => deleteJournal(journal.id)}
                          >
                            <i className="fas fa-trash me-2"></i>
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="journal-content">
                    <p className="text-muted mb-0">
                      {journal.content.length > 200 
                        ? `${journal.content.substring(0, 200)}...` 
                        : journal.content}
                    </p>
                  </div>
                  
                  {journal.content.length > 200 && (
                    <div className="mt-3">
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        data-bs-toggle="modal"
                        data-bs-target={`#journalModal${journal.id}`}
                      >
                        <i className="fas fa-expand me-1"></i>
                        Read More
                      </button>
                    </div>
                  )}
                </div>

                {/* Full Journal Modal */}
                <div className="modal fade" id={`journalModal${journal.id}`} tabIndex="-1">
                  <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">{journal.title}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                      </div>
                      <div className="modal-body">
                        <div className="journal-meta mb-3">
                          <i className="fas fa-calendar me-1"></i>
                          {formatDateTime(journal.created_at)}
                          {journal.mood_entry && (
                            <span className="ms-3">
                              <span className="me-1">
                                {getMoodEmoji(journal.mood_entry.mood_level)}
                              </span>
                              {getMoodLabel(journal.mood_entry.mood_level)}
                            </span>
                          )}
                        </div>
                        <div className="journal-content">
                          <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                            {journal.content}
                          </p>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                          Close
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => {
                            deleteJournal(journal.id)
                            // Close modal
                            const modal = document.getElementById(`journalModal${journal.id}`)
                            const bsModal = bootstrap.Modal.getInstance(modal)
                            if (bsModal) bsModal.hide()
                          }}
                        >
                          <i className="fas fa-trash me-2"></i>
                          Delete Entry
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="row">
            <div className="col-12">
              {renderPagination()}
            </div>
          </div>
        </>
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="text-center py-5">
              <i className="fas fa-book fa-4x text-muted mb-3"></i>
              <h4>No Journal Entries Found</h4>
              <p className="text-muted mb-4">
                {searchTerm 
                  ? `No entries match "${searchTerm}". Try a different search term.`
                  : 'Start your journaling journey by writing your first entry.'}
              </p>
              {!searchTerm && (
                <Link to="/add-journal" className="btn btn-primary">
                  <i className="fas fa-pen me-2"></i>
                  Write Your First Entry
                </Link>
              )}
              {searchTerm && (
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="fas fa-times me-2"></i>
                  Clear Search
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay for pagination */}
      {loading && journals.length > 0 && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.1)', zIndex: 1050 }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Journals