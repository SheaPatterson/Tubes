"use client";

import * as React from "react";

// ── Types ──

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Rendered when an error is caught */
  fallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode);
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// ── Error Boundary Component ──

/**
 * React error boundary that catches rendering errors in its subtree
 * and displays a fallback UI. Supports reset to retry rendering.
 *
 * Requirements: 21.3 (recover from unhandled exceptions with notification)
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;

      if (typeof fallback === "function") {
        return fallback(this.state.error, this.reset);
      }

      if (fallback) {
        return fallback;
      }

      return (
        <div role="alert" className="p-4 text-sm text-destructive">
          <p>Something went wrong.</p>
          <button
            type="button"
            onClick={this.reset}
            className="mt-2 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ── Hook ──

/**
 * Hook to programmatically trigger the nearest error boundary.
 * Useful for catching errors in event handlers or async code
 * that React error boundaries don't catch automatically.
 */
export function useErrorHandler(): (error: Error) => void {
  const [, setState] = React.useState();

  return React.useCallback((error: Error) => {
    setState(() => {
      throw error;
    });
  }, []);
}
