import { AlertTriangle, RefreshCw } from "lucide-react";
import { Component, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fa } from "@/constants/text";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

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
    console.error("ErrorBoundary caught an error:", error, errorInfo);

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
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="bg-destructive/10 mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
                <AlertTriangle className="text-destructive size-6" />
              </div>
              <CardTitle>{fa.errors.boundary.title}</CardTitle>
              <CardDescription>
                {fa.errors.boundary.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="bg-muted rounded-md p-3">
                  <p className="text-muted-foreground font-mono text-sm">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="mr-2 size-4" />
                  {fa.errors.boundary.tryAgain}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  {fa.errors.boundary.reloadPage}
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
    console.error("Error caught by useErrorHandler:", error, errorInfo);
    // You can add error reporting logic here
  };
}
