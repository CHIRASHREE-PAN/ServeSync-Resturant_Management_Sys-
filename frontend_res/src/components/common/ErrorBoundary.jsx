import React from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
          <Card className="max-w-lg border border-error/20 p-6 text-center shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">ServeSync</p>
            <h2 className="mt-3 text-2xl font-semibold text-text">Something went wrong</h2>
            <p className="mt-2 text-sm text-secondary-text">
              The page encountered an unexpected error. Try again or refresh the browser to continue.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={this.resetError}>Try again</Button>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Reload page
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
