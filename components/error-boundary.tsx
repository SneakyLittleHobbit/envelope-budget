'use client'

import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
          <AlertTriangle className="h-12 w-12 text-budget-red" />
          <h2 className="text-budget-text text-lg font-medium">Something went wrong</h2>
          <p className="text-budget-text-secondary text-sm text-center">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-budget-green text-budget-bg rounded-full text-sm font-medium touch-manipulation"
          >
            Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
