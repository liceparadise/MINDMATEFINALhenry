import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="fas fa-brain me-2"></i>
          MindMate
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard">
                    <i className="fas fa-tachometer-alt me-1"></i>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/add-mood')}`} to="/add-mood">
                    <i className="fas fa-plus-circle me-1"></i>
                    Track Mood
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/mood-history')}`} to="/mood-history">
                    <i className="fas fa-chart-line me-1"></i>
                    History
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/journals')}`} to="/journals">
                    <i className="fas fa-book me-1"></i>
                    Journals
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/achievements')}`} to="/achievements">
                    <i className="fas fa-trophy me-1"></i>
                    Achievements
                  </Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav">
            {isAuthenticated ? (
              <>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-user-circle me-1"></i>
                    {user?.first_name || user?.username || 'User'}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="fas fa-user me-2"></i>
                        Profile
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/login')}`} to="/login">
                    <i className="fas fa-sign-in-alt me-1"></i>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/signup')}`} to="/signup">
                    <i className="fas fa-user-plus me-1"></i>
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar