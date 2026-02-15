import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

const { publicVars } = loadEnv();

export default defineConfig({
  logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  plugins: [pluginReact()],
  source: {
    define: publicVars,
  },
  environments: {
    web: {
      source: {
        entry: {
          index: './src/index.client',
        },
      },
      output: {
        manifest: true,
      },
      performance: {
        removeConsole: process.env.NODE_ENV === 'production',
        chunkSplit: {
          strategy: 'split-by-experience',
        },
        ...(process.env.ANALYZE === 'true' && {
          bundleAnalyze: {
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: '../bundle-report.html',
          },
        }),
      },
    },
    node: {
      output: {
        module: true,
        target: 'node',
        distPath: {
          root: 'dist/server',
        },
      },
      source: {
        entry: {
          index: './src/index.server',
        },
      },
    },
  },
  tools: {
    htmlPlugin: false,
  },
  html: {
    template: './template.html',
    templateParameters: {
      title: 'Better Auth App',
    },
  },
});
