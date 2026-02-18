import fs from 'node:fs';
import path from 'node:path';
import type { RsbuildDevServer } from '@rsbuild/core';
import type { Context } from 'hono';

interface ServerBundle {
  render: (pathname: string) => string;
}

interface Manifest {
  entries: {
    index: {
      initial: {
        js?: string[];
        css?: string[];
      };
    };
  };
}

/**
 * Creates a server-side rendering handler with shared logic
 *
 * @param templateHtml - HTML template string with placeholders
 * @param loadBundle - Async function that returns the server bundle
 * @param getManifest - Optional function that returns manifest JSON string
 * @returns Hono middleware function for rendering requests
 */
export const createServerRenderer = (
  templateHtml: string,
  loadBundle: () => Promise<ServerBundle>,
  getManifest: () => string | null = () => null,
) => {
  return async (c: Context) => {
    const bundle = await loadBundle();
    const pathname = new URL(c.req.url).pathname;
    const markup = bundle.render(pathname);

    let html = templateHtml.replace('<!--app-content-->', markup);

    const manifestData = getManifest();
    if (manifestData) {
      try {
        const { entries } = JSON.parse(manifestData) as Manifest;
        const { js = [], css = [] } = entries.index.initial;

        const scriptTags = js
          .map((file: string) => `<script src="${file}" defer></script>`)
          .join('\n');
        const styleTags = css
          .map((file: string) => `<link rel="stylesheet" href="${file}">`)
          .join('\n');

        html = html.replace('<!--app-head-->', `${scriptTags}\n${styleTags}`);
      } catch (_err) {
        console.warn('Failed to parse manifest, using fallback');
        html = html.replace('<!--app-head-->', '');
      }
    } else {
      html = html.replace('<!--app-head-->', '');
    }

    return c.html(html);
  };
};

/**
 * Creates a development server renderer with hot-reloading support
 *
 * @param serverAPI - Rsbuild development server instance
 * @param templateHtml - HTML template string
 * @returns Hono middleware function for development rendering
 */
export const createDevRenderer = (
  serverAPI: RsbuildDevServer,
  templateHtml: string,
) => {
  return createServerRenderer(
    templateHtml,
    async () => {
      const indexModule = (await serverAPI.environments.node.loadBundle(
        'index',
      )) as ServerBundle;
      return indexModule;
    },
    () => {
      try {
        return fs.readFileSync('./dist/manifest.json', 'utf-8');
      } catch {
        return null;
      }
    },
  );
};

/**
 * Creates a production server renderer for static bundles
 *
 * @param templateHtml - HTML template string
 * @returns Hono middleware function for production rendering
 */
export const createProdRenderer = (templateHtml: string) => {
  return createServerRenderer(
    templateHtml,
    async () => {
      const remotesPath = path.join(process.cwd(), `./dist/server/index.js`);
      const module = await import(remotesPath);
      return module.default || module;
    },
    () => {
      try {
        return fs.readFileSync('./dist/manifest.json', 'utf-8');
      } catch {
        return null;
      }
    },
  );
};
