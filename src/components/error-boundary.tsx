import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Component, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { common, errors } from "@/constants";
import { logError } from "@/lib/logger";

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError("ErrorBoundary caught an error", error, {
      componentStack: errorInfo.componentStack,
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // You could also send error reports to a service here
    // Example: errorReportingService.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md rounded-[var(--ds-radius-card)] shadow-lg">
            <CardHeader className="text-center">
              <div className="bg-destructive/10 mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
                <AlertTriangle className="text-destructive size-6" />
              </div>
              <CardTitle className="text-xl font-bold">
                {errors.boundary.title}
              </CardTitle>
              <CardDescription className="font-medium">
                {errors.boundary.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-muted-foreground font-mono text-xs leading-relaxed">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={this.handleRetry}
                  className="h-11 flex-1 rounded-xl font-bold"
                >
                  <RefreshCw className="me-2 size-4" />
                  {common.buttons.retry}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="h-11 flex-1 rounded-xl font-bold"
                >
                  <ArrowLeft className="me-2 size-4" />
                  {common.buttons.back}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    logError("Error caught by useErrorHandler", error, {
      componentStack: errorInfo?.componentStack,
    });
    // You can add error reporting logic here
  };
}
