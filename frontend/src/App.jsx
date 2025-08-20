import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import AddMood from './pages/AddMood'
import MoodHistory from './pages/MoodHistory'
import Journals from './pages/Journals'
import AddJournal from './pages/AddJournal'
import Profile from './pages/Profile'
import Achievements from './pages/Achievements'
import NotFound from './pages/NotFound'
import './App.css'

function AppContent() {
  return (
    <div className="App">
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Signup />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/track-mood" 
            element={
              <ProtectedRoute>
                <AddMood />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <MoodHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/journals" 
            element={
              <ProtectedRoute>
                <Journals />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/journals/new" 
            element={
              <ProtectedRoute>
                <AddJournal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/journals/new/:moodId" 
            element={
              <ProtectedRoute>
                <AddJournal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/achievements" 
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App