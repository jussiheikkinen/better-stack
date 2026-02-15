import type { MiddlewareHandler } from 'hono';
import { csrf } from 'hono/csrf';
import { secureHeaders } from 'hono/secure-headers';

export const securityMiddleware = (): MiddlewareHandler[] => {
  return [secureHeaders(), csrf()];
};
