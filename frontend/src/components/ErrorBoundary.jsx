import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
          <div className="max-w-md rounded-lg border border-red-500/30 bg-red-900/20 p-6 text-center">
            <h2 className="mb-2 text-2xl font-bold text-red-300">Oops! Something went wrong</h2>
            <p className="mb-4 text-sm text-red-200">{this.state.error?.message}</p>
            <button
              onClick={this.handleRetry}
              className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
