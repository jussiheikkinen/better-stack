import fs from 'node:fs';
import type { Server } from 'node:http';
import { serve } from '@hono/node-server';
import {
  createRsbuild,
  loadConfig,
  logger,
  type RsbuildDevServer,
} from '@rsbuild/core';
import { type Context, Hono, type Next } from 'hono';
import { createMiddleware } from 'hono/factory';
import { securityMiddleware } from './src/middleware/security';
import { apiRoutes } from './src/routes/api';

const templateHtml = fs.readFileSync('./template.html', 'utf-8');

// Define what your server bundle exports
interface ServerBundle {
  render: (pathname: string) => string;
}

let manifest: string | undefined;

const serverRender = (serverAPI: RsbuildDevServer) => async (c: Context) => {
  const indexModule = (await serverAPI.environments.node.loadBundle(
    'index',
  )) as ServerBundle;
  const pathname = new URL(c.req.url).pathname;
  const markup = indexModule.render(pathname);

  let html = templateHtml.replace('<!--app-content-->', markup);

  if (manifest) {
    try {
      const { entries } = JSON.parse(manifest);
      const { js = [], css = [] } = entries.index.initial;

      const scriptTags = js
        .map((file: string) => `<script src="${file}" defer></script>`)
        .join('\n');
      const styleTags = css
        .map((file: string) => `<link rel="stylesheet" href="${file}">`)
        .join('\n');

      html = html.replace('<!--app-head-->', `${scriptTags}\n${styleTags}`);
    } catch (_err) {
      logger.warn('Failed to parse manifest, using fallback');
      html = html.replace('<!--app-head-->', '');
    }
  } else {
    html = html.replace('<!--app-head-->', '');
  }

  return c.html(html);
};

export async function startDevServer() {
  const { content } = await loadConfig({});

  const rsbuild = await createRsbuild({
    rsbuildConfig: content,
  });

  rsbuild.onAfterDevCompile(async () => {
    // update manifest info when rebuild
    try {
      manifest = await fs.promises.readFile('./dist/manifest.json', 'utf-8');
    } catch (_err) {
      logger.warn('Manifest not found, will be generated on next build');
    }
  });

  // Try to load initial manifest if it exists
  try {
    manifest = await fs.promises.readFile('./dist/manifest.json', 'utf-8');
  } catch (_err) {
    logger.info('No initial manifest found, will be generated on first build');
  }

  const app = new Hono();
  app.use(...securityMiddleware());

  // Apply security middleware to all routes
  // app.use('*', securityMiddleware());

  // Create Rsbuild DevServer instance
  const rsbuildServer = await rsbuild.createDevServer();

  // register routes
  apiRoutes(app);

  // Wrap Rsbuild Connect middlewares for Hono
  app.use(
    '*',
    createMiddleware(async (c: Context, next: Next) => {
      return new Promise<void>((resolve) => {
        rsbuildServer.middlewares(c.env.incoming, c.env.outgoing, () => {
          resolve(next());
        });
      });
    }),
  );

  const renderHandler = serverRender(rsbuildServer);

  app.get('*', async (c: Context, next: Next) => {
    try {
      return await renderHandler(c);
    } catch (err: unknown) {
      logger.error('SSR render error, downgrade to CSR...');
      logger.error(err);
      // If SSR fails, we call next() to let Rsbuild's
      // static middleware handle the request (CSR)
      return await next();
    }
  });

  // Start the Node server
  const httpServer = serve(
    {
      fetch: app.fetch,
      port: rsbuildServer.port,
    },
    () => {
      rsbuildServer.afterListen();
    },
  );

  rsbuildServer.connectWebSocket({ server: httpServer as unknown as Server });

  return {
    close: async () => {
      await rsbuildServer.close();
      httpServer.close();
    },
  };
}

startDevServer();
