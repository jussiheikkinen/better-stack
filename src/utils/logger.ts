// Add these imports at the top when you want to use external services
// import * as Sentry from '@sentry/browser';
// import { datadogLogs } from '@datadog/browser-logs';

export const logger = {
  error: (
    message: string,
    error?: Error,
    context?: Record<string, unknown>,
  ) => {
    console.error(
      `[${new Date().toISOString()}] ERROR | ${message}`,
      error,
      context,
    );

    // Uncomment for Sentry:
    // Sentry.captureException(error || new Error(message), {
    //   tags: { component: context?.component },
    //   extra: context,
    // });

    // Uncomment for Datadog:
    // datadogLogs.logger.error(message, { error, ...context });
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(`[${new Date().toISOString()}] WARN | ${message}`, context);

    // Uncomment for Datadog:
    // datadogLogs.logger.warn(message, context);
  },
  info: (message: string, context?: Record<string, unknown>) => {
    console.info(`[${new Date().toISOString()}] INFO | ${message}`, context);

    // Uncomment for Datadog:
    // datadogLogs.logger.info(message, context);
  },
};
