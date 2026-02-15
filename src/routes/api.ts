import type { Hono } from 'hono';
import { auth } from '../utils/auth';

export const apiRoutes = (app: Hono) => {
  // app.use('/api/auth/*', rateLimiter({ max: 10 }));
  app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));
  // Add other shared API routes here in the future
};
