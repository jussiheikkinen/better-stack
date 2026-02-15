import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth client instance
 * Provides direct access to authentication methods and hooks
 */
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: import.meta.env.PUBLIC_APP_URL || 'http://localhost:3000',
});
