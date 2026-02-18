import fs from 'node:fs';
import type { Server } from 'node:http';
import { serve } from '@hono/node-server';
import { createRsbuild, loadConfig, logger } from '@rsbuild/core';
import { type Context, Hono, type Next } from 'hono';
import { createMiddleware } from 'hono/factory';
import { securityMiddleware } from './src/middleware/security';
import { apiRoutes } from './src/routes/api';
import { createDevRenderer } from './src/utils/server-renderer';

// Load HTML template once at startup for SSR
const templateHtml = fs.readFileSync('./template.html', 'utf-8');

export async function startDevServer() {
  // Load Rsbuild configuration for development
  const { content } = await loadConfig({});
  let lastBuildTime = Date.now();

  // Create Rsbuild instance with development config
  const rsbuild = await createRsbuild({
    rsbuildConfig: content,
  });

  // Monitor build performance after each compilation
  rsbuild.onAfterDevCompile(async () => {
    const buildTime = Date.now() - lastBuildTime;
    console.log(`✅ Build completed in ${buildTime}ms`);
    lastBuildTime = Date.now();
  });

  // Create Hono application instance
  const app = new Hono();
  // Apply security headers and CSRF protection globally
  app.use(...securityMiddleware());

  // Create Rsbuild DevServer instance (handles HMR, asset serving)
  const server = await rsbuild.createDevServer();

  // Register API routes before static assets
  apiRoutes(app);

  // Bridge Rsbuild's Connect middleware to Hono's request pipeline
  app.use(
    '*',
    createMiddleware(async (c: Context, next: Next) => {
      return new Promise<void>((resolve) => {
        // Route request through Rsbuild's middleware (static files, HMR)
        server.middlewares(c.env.incoming, c.env.outgoing, () => {
          resolve(next());
        });
      });
    }),
  );

  // Create SSR renderer using shared server renderer utility
  const renderHandler = createDevRenderer(server, templateHtml);

  // Handle all GET requests with SSR fallback to CSR
  app.get('*', async (c: Context, next: Next) => {
    try {
      // Attempt server-side rendering
      return await renderHandler(c);
    } catch (err: unknown) {
      logger.error('SSR render error, downgrade to CSR...');
      logger.error(err);
      // If SSR fails, we call next() to let Rsbuild's
      // static middleware handle the request (CSR)
      return await next();
    }
  });

  // Start the Node server with Hono's fetch handler
  const httpServer = serve(
    {
      fetch: app.fetch,
      port: server.port,
    },
    () => {
      server.afterListen();
    },
  );

  // Enable Hot Module Replacement via WebSocket
  server.connectWebSocket({ server: httpServer as unknown as Server });

  return {
    close: async () => {
      await server.close();
      httpServer.close();
    },
  };
}

startDevServer();
