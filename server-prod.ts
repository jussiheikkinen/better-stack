import fs from 'node:fs';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { type Context, Hono, type Next } from 'hono';
import { securityMiddleware } from './src/middleware/security';
import { apiRoutes } from './src/routes/api';
import { createProdRenderer } from './src/utils/server-renderer';

// Production server configuration
const port = process.env.PORT || 3000;
// Load HTML template once at startup for SSR
const templateHtml = fs.readFileSync('./template.html', 'utf-8');
// Create production SSR renderer (loads compiled bundles from disk)
const serverRender = createProdRenderer(templateHtml);

export async function preview() {
  // Create Hono application instance
  const app = new Hono();
  // Apply security headers and CSRF protection globally
  app.use(...securityMiddleware());

  // Register API routes before static assets (prevents conflicts)
  apiRoutes(app);

  // Serve static assets from dist directory (CSS, JS, images)
  app.use('/static/*', serveStatic({ root: './dist' }));
  app.use('/favicon.png', serveStatic({ root: './dist' }));

  // Handle all other routes with SSR (fallback to CSR on error)
  app.get('*', async (c: Context, next: Next) => {
    try {
      // Attempt server-side rendering
      return serverRender(c);
    } catch (err) {
      console.error('SSR render error, downgrade to CSR...\n', err);
      // If SSR fails, let static middleware serve client-side bundle
      await next();
    }
  });

  // Start production server
  serve(
    {
      fetch: app.fetch,
      port: Number(port),
    },
    (info) => {
      console.log(`Server started at http://localhost:${info.port}`);
    },
  );
}

preview();
