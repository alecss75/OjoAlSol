import { Component } from 'react'
import { AppError } from '../utils/errors.js'

/**
 * Error Boundary component to catch and display errors
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ errorInfo })

    // Log to error reporting service in production
    if (import.meta.env.PROD) {
      // TODO: Integrate with error reporting service (e.g., Sentry)
      console.error('Production error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state

      // Custom error UI based on error type
      if (error instanceof AppError) {
        return (
          <div className="error-boundary" role="alert" aria-live="assertive">
            <div className="error-content">
              <h1>Oops! Something went wrong</h1>
              <p className="error-code">Error: {error.code}</p>
              <p className="error-message">{error.message}</p>
              <button className="btn-primary" onClick={this.handleReset}>
                Reload Application
              </button>
            </div>
          </div>
        )
      }

      // Generic error UI
      return (
        <div className="error-boundary" role="alert" aria-live="assertive">
          <div className="error-content">
            <h1>We're sorry, something went wrong</h1>
            <p className="error-message">
              {error?.message || 'An unexpected error occurred'}
            </p>
            <details className="error-details">
              <summary>Show technical details</summary>
              <pre>{error?.stack}</pre>
            </details>
            <button className="btn-primary" onClick={this.handleReset}>
              Reload Application
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
