import React from 'react'

const Loading = ({ 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false,
  color = 'primary'
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'spinner-border-sm'
      case 'large':
        return 'spinner-border-lg'
      default:
        return ''
    }
  }

  const getColorClass = () => {
    return `text-${color}`
  }

  const LoadingContent = () => (
    <div className={`d-flex flex-column align-items-center justify-content-center ${fullScreen ? 'min-vh-100' : 'py-5'}`}>
      <div className={`spinner-border ${getSizeClass()} ${getColorClass()} mb-3`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && (
        <p className={`text-muted mb-0 ${size === 'small' ? 'small' : ''}`}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75" style={{ zIndex: 9999 }}>
        <LoadingContent />
      </div>
    )
  }

  return <LoadingContent />
}

// Inline loading spinner for buttons and small spaces
export const InlineLoading = ({ size = 'sm', className = '' }) => (
  <span className={`spinner-border spinner-border-${size} ${className}`} role="status" aria-hidden="true"></span>
)

// Loading skeleton for content placeholders
export const LoadingSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`loading-skeleton ${className}`}>
    {Array.from({ length: lines }, (_, index) => (
      <div key={index} className="skeleton-line mb-2"></div>
    ))}
  </div>
)

// Loading card placeholder
export const LoadingCard = ({ className = '' }) => (
  <div className={`card ${className}`}>
    <div className="card-body">
      <div className="skeleton-line skeleton-title mb-3"></div>
      <div className="skeleton-line mb-2"></div>
      <div className="skeleton-line mb-2"></div>
      <div className="skeleton-line skeleton-short"></div>
    </div>
  </div>
)

export default Loading