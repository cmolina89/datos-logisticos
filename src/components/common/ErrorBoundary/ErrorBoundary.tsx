import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Message } from 'primereact/message'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import './ErrorBoundary.scss'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  eventId: string | null
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo)

    // Log to external service (Sentry, LogRocket, etc.)
    this.logErrorToService(error, errorInfo)
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, idx) => prevProps.resetKeys?.[idx] !== key)) {
        this.resetErrorBoundary()
      }
    }

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary()
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Here you would integrate with your error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });

    // For now, we'll just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }
  }

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    })
  }

  private handleRetry = () => {
    this.resetErrorBoundary()
  }

  private handleReload = () => {
    window.location.reload()
  }

  private renderErrorDetails = () => {
    const { error, errorInfo } = this.state

    if (process.env.NODE_ENV !== 'development') {
      return null
    }

    return (
      <details className="error-details">
        <summary>Error Details (Development Only)</summary>
        <div className="error-content">
          <h4>Error Message:</h4>
          <pre>{error?.message}</pre>

          <h4>Stack Trace:</h4>
          <pre>{error?.stack}</pre>

          {errorInfo && (
            <>
              <h4>Component Stack:</h4>
              <pre>{errorInfo.componentStack}</pre>
            </>
          )}
        </div>
      </details>
    )
  }

  render() {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <Card className="error-card">
            <div className="error-content">
              <div className="error-icon">
                <i className="pi pi-exclamation-triangle" />
              </div>

              <h2>¡Oops! Algo salió mal</h2>

              <Message
                severity="error"
                text="Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado."
                className="error-message"
              />

              <p className="error-description">
                Puedes intentar recargar la página o contactar al soporte técnico si el problema
                persiste.
              </p>

              <div className="error-actions">
                <Button
                  label="Reintentar"
                  icon="pi pi-refresh"
                  onClick={this.handleRetry}
                  className="p-button-outlined"
                />
                <Button
                  label="Recargar Página"
                  icon="pi pi-replay"
                  onClick={this.handleReload}
                  severity="secondary"
                />
              </div>

              {this.renderErrorDetails()}
            </div>
          </Card>
        </div>
      )
    }

    return children
  }
}

export default ErrorBoundary
