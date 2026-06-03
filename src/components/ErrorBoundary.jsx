import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidMount() {
    this.handleGlobalError = (event) => {
      console.error('Global error caught by boundary:', event.error || event.message);
      this.setState({
        hasError: true,
        error: event.error || new Error(event.message || 'Unknown error'),
      });
    };

    this.handlePromiseRejection = (event) => {
      console.error('Unhandled promise rejection caught by boundary:', event.reason);
      const reason = event.reason;
      const error = reason instanceof Error ? reason : new Error(String(reason || 'Unhandled Promise Rejection'));
      this.setState({
        hasError: true,
        error,
      });
    };

    window.addEventListener('error', this.handleGlobalError);
    window.addEventListener('unhandledrejection', this.handlePromiseRejection);
  }

  componentWillUnmount() {
    if (this.handleGlobalError) {
      window.removeEventListener('error', this.handleGlobalError);
    }
    if (this.handlePromiseRejection) {
      window.removeEventListener('unhandledrejection', this.handlePromiseRejection);
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="va-bg absolute inset-0" aria-hidden="true" />
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full relative z-10">
            <div className="mb-4">
              <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-10a9 9 0 110 18 9 9 0 010-18z" />
                </svg>
              </div>
            </div>
            <h1 className="text-center text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-center text-gray-600 mb-4">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="mb-4 p-3 bg-gray-100 rounded text-sm text-gray-700 overflow-auto max-h-40">
                <summary className="cursor-pointer font-semibold mb-2">Error details</summary>
                <pre className="whitespace-pre-wrap break-words text-xs">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
