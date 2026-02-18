import type { ErrorInfo } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { logger } from '@/utils/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  FallbackComponent?: React.ComponentType<FallbackProps>;
  onError?: (error: unknown, info: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: Array<string | number | boolean>;
}

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-4">Please try refreshing the page.</p>
        <details className="text-left mt-4" open>
          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
            Error details
          </summary>
          <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded text-sm text-left">
            <pre className="text-red-700 whitespace-pre-wrap">
              {error instanceof Error
                ? error.message
                : JSON.stringify(error, null, 2)}
            </pre>
          </div>
        </details>
        <button
          onClick={resetErrorBoundary}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          type="button"
        >
          Try again
        </button>
      </div>
    </div>
  );
};

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  onError,
  ...rest
}) => {
  const handleError = (error: unknown, info: ErrorInfo) => {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    logger.error('React Error Boundary caught an error', errorObj, {
      component: 'ErrorBoundary',
      errorInfo: info,
      stack: info.componentStack,
    });

    // Call custom onError if provided
    if (onError) {
      onError(error, info);
    }
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      {...rest}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>,
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  // Set display name for debugging
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

export default ErrorBoundary;
