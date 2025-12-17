import React from "react";

type Props = {
  children: React.ReactNode;
  onRetry?: () => void;
};

type State = {
  error: Error | null;
};

export class PageErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  handleRetry = () => {
    this.setState({ error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {this.state.error.message || "An unexpected error occurred."}
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="bg-primary text-primary-foreground mt-4 inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

