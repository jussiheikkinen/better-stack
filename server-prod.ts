import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { type Context, Hono, type Next } from 'hono';
import { securityMiddleware } from './src/middleware/security';
import { apiRoutes } from './src/routes/api';

const require = createRequire(import.meta.url);
const port = process.env.PORT || 3000;

const templateHtml = fs.readFileSync('./template.html', 'utf-8');

const serverRender = (c: Context) => {
  const remotesPath = path.join(process.cwd(), `./dist/server/index.js`);

  const importedApp = require(remotesPath);
  const pathname = new URL(c.req.url).pathname;
  const markup = importedApp.render(pathname);

  const { entries } = JSON.parse(
    fs.readFileSync('./dist/manifest.json', 'utf-8'),
  );
  const { js = [], css = [] } = entries.index.initial;

  const scriptTags = js
    .map((file: string) => `<script src="${file}" defer></script>`)
    .join('\n');
  const styleTags = css
    .map((file: string) => `<link rel="stylesheet" href="${file}">`)
    .join('\n');

  const html = templateHtml
    .replace('<!--app-head-->', `${scriptTags}\n${styleTags}`)
    .replace('<!--app-content-->', markup);

  return c.html(html);
};

export async function preview() {
  const app = new Hono();
  app.use(...securityMiddleware());
  // Apply security middleware to all routes
  // app.use('*', securityMiddleware());

  // register API routes first
  apiRoutes(app);

  // 1. Static Assets (only serve actual static files)
  app.use('/static/*', serveStatic({ root: './dist' }));
  app.use('/favicon.png', serveStatic({ root: './dist' }));

  // 2. SSR Route (handle all other routes)
  app.get('*', async (c: Context, next: Next) => {
    try {
      return serverRender(c);
    } catch (err) {
      console.error('SSR render error, downgrade to CSR...\n', err);
      await next();
    }
  });

  // 3. Start Server
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
