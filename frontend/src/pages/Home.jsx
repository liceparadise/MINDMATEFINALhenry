import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center min-vh-75">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                Your Mental Health Journey Starts Here
              </h1>
              <p className="lead mb-4">
                MindMate is your personal companion for tracking mood, managing emotions, 
                and building better mental health habits. Start your journey to wellness today.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/signup" className="btn btn-light btn-lg px-4">
                  <i className="fas fa-rocket me-2"></i>
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Sign In
                </Link>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <img 
                src="/static/images/mindmate-hero.svg" 
                alt="MindMate Mental Health App" 
                className="img-fluid"
                style={{ maxHeight: '400px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-lg-8 mx-auto">
              <h2 className="display-5 fw-bold mb-3">Why Choose MindMate?</h2>
              <p className="lead text-muted">
                Discover the features that make MindMate your perfect mental health companion
              </p>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 text-center border-0">
                <div className="card-body">
                  <div className="feature-icon bg-primary text-white mx-auto mb-3">
                    <i className="fas fa-heart fa-2x"></i>
                  </div>
                  <h5 className="card-title">Mood Tracking</h5>
                  <p className="card-text text-muted">
                    Track your daily emotions and identify patterns in your mental health journey.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card h-100 text-center border-0">
                <div className="card-body">
                  <div className="feature-icon bg-success text-white mx-auto mb-3">
                    <i className="fas fa-chart-line fa-2x"></i>
                  </div>
                  <h5 className="card-title">Progress Analytics</h5>
                  <p className="card-text text-muted">
                    Visualize your progress with beautiful charts and insightful analytics.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card h-100 text-center border-0">
                <div className="card-body">
                  <div className="feature-icon bg-info text-white mx-auto mb-3">
                    <i className="fas fa-book fa-2x"></i>
                  </div>
                  <h5 className="card-title">Personal Journal</h5>
                  <p className="card-text text-muted">
                    Express your thoughts and feelings in a private, secure journal.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card h-100 text-center border-0">
                <div className="card-body">
                  <div className="feature-icon bg-warning text-white mx-auto mb-3">
                    <i className="fas fa-bell fa-2x"></i>
                  </div>
                  <h5 className="card-title">Smart Reminders</h5>
                  <p className="card-text text-muted">
                    Get gentle reminders to check in with yourself and maintain healthy habits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row text-center">
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stat-card">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Happy Users</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stat-card">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Mood Entries</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stat-card">
                <div className="stat-number">25K+</div>
                <div className="stat-label">Journal Entries</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stat-card">
                <div className="stat-number">99%</div>
                <div className="stat-label">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <h2 className="display-5 fw-bold mb-3">Ready to Start Your Journey?</h2>
              <p className="lead text-muted mb-4">
                Join thousands of users who have improved their mental health with MindMate.
                Your journey to better mental wellness starts with a single step.
              </p>
              <Link to="/signup" className="btn btn-primary btn-lg px-5">
                <i className="fas fa-rocket me-2"></i>
                Start Free Today
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home