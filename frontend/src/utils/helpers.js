// Date formatting utilities
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Mood utilities
export const moodOptions = [
  { value: 1, label: 'Very Sad', emoji: '😢', color: '#e74c3c' },
  { value: 2, label: 'Sad', emoji: '😞', color: '#f39c12' },
  { value: 3, label: 'Neutral', emoji: '😐', color: '#95a5a6' },
  { value: 4, label: 'Happy', emoji: '😊', color: '#2ecc71' },
  { value: 5, label: 'Very Happy', emoji: '😄', color: '#27ae60' }
]

export const getMoodData = (value) => {
  return moodOptions.find(mood => mood.value === value) || moodOptions[2]
}

export const getMoodEmoji = (value) => {
  const mood = getMoodData(value)
  return mood.emoji
}

export const getMoodLabel = (value) => {
  const mood = getMoodData(value)
  return mood.label
}

export const getMoodColor = (value) => {
  const mood = getMoodData(value)
  return mood.color
}

// Chart utilities
export const generateChartColors = (count) => {
  const colors = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#f5576c',
    '#4facfe',
    '#00f2fe',
    '#43e97b',
    '#38f9d7',
    '#ffecd2',
    '#fcb69f'
  ]
  
  return Array.from({ length: count }, (_, i) => colors[i % colors.length])
}

// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 8
}

// Local storage utilities
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return defaultValue
  }
}

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error writing to localStorage:', error)
  }
}

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from localStorage:', error)
  }
}

// Error handling utilities
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.response?.data?.error) {
    return error.response.data.error
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// Debounce utility
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}