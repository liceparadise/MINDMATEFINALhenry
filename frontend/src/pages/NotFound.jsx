import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <div className="error-container fade-in">
            {/* 404 Illustration */}
            <div className="error-illustration mb-4">
              <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Cloud */}
                <ellipse cx="100" cy="60" rx="40" ry="20" fill="#e9ecef" />
                <ellipse cx="85" cy="55" rx="25" ry="15" fill="#e9ecef" />
                <ellipse cx="115" cy="55" rx="25" ry="15" fill="#e9ecef" />
                
                {/* Rain drops */}
                <circle cx="90" cy="85" r="2" fill="#6c757d" />
                <circle cx="100" cy="95" r="2" fill="#6c757d" />
                <circle cx="110" cy="85" r="2" fill="#6c757d" />
                <circle cx="95" cy="105" r="2" fill="#6c757d" />
                <circle cx="105" cy="105" r="2" fill="#6c757d" />
                
                {/* Sad face */}
                <circle cx="85" cy="120" r="2" fill="#6c757d" />
                <circle cx="115" cy="120" r="2" fill="#6c757d" />
                <path d="M 90 130 Q 100 125 110 130" stroke="#6c757d" strokeWidth="2" fill="none" />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="display-1 fw-bold text-primary mb-3">404</h1>
            <h2 className="h3 fw-bold mb-3">Oops! Page Not Found</h2>
            <p className="text-muted mb-4 lead">
              The page you're looking for seems to have wandered off. 
              Don't worry, even the best explorers sometimes take a wrong turn.
            </p>

            {/* Action Buttons */}
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mb-4">
              <Link to="/" className="btn btn-primary px-4">
                <i className="fas fa-home me-2"></i>
                Go Home
              </Link>
              <Link to="/dashboard" className="btn btn-outline-primary px-4">
                <i className="fas fa-tachometer-alt me-2"></i>
                Dashboard
              </Link>
              <button 
                onClick={() => window.history.back()} 
                className="btn btn-outline-secondary px-4"
              >
                <i className="fas fa-arrow-left me-2"></i>
                Go Back
              </button>
            </div>

            {/* Helpful Links */}
            <div className="helpful-links">
              <h6 className="fw-bold mb-3">Maybe you were looking for:</h6>
              <div className="row g-2">
                <div className="col-6 col-sm-3">
                  <Link to="/track-mood" className="btn btn-outline-info btn-sm w-100">
                    <i className="fas fa-smile me-1"></i>
                    Track Mood
                  </Link>
                </div>
                <div className="col-6 col-sm-3">
                  <Link to="/history" className="btn btn-outline-success btn-sm w-100">
                    <i className="fas fa-chart-line me-1"></i>
                    History
                  </Link>
                </div>
                <div className="col-6 col-sm-3">
                  <Link to="/journals" className="btn btn-outline-warning btn-sm w-100">
                    <i className="fas fa-book me-1"></i>
                    Journals
                  </Link>
                </div>
                <div className="col-6 col-sm-3">
                  <Link to="/profile" className="btn btn-outline-secondary btn-sm w-100">
                    <i className="fas fa-user me-1"></i>
                    Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Fun Facts */}
            <div className="mt-5 p-4 bg-light rounded">
              <h6 className="fw-bold mb-3">
                <i className="fas fa-lightbulb me-2 text-warning"></i>
                Did You Know?
              </h6>
              <p className="text-muted mb-0 small">
                The HTTP 404 error was named after room 404 at CERN, where the World Wide Web was invented. 
                Though this is actually a myth - the real reason is much more boring: it's just the fourth type of client error (4xx) in the HTTP specification!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound