import { createConfig } from '@nx/angular-rspack';

export default createConfig(
  // First argument: Base configuration options
  {
    options: {
      root: __dirname,
      outputPath: {
        base: '../dist/frontend',
      },
      index: './src/index.html',
      browser: './src/main.ts',
      polyfills: ['zone.js'],
      tsConfig: './tsconfig.app.json',
      assets: [
        {
          glob: '**/*',
          input: './public',
        },
      ],
      styles: ['./src/styles.css'],
      devServer: {
        liveReload: true,
      },
      ssr: {
        entry: './src/server.ts',
      },
      server: './src/main.server.ts',
      prerender: {
        discoverRoutes: true,
        routes: ['/'],
      },
    },
    rspackConfigOverrides: {
      resolve: {
        fallback: {
          bufferutil: false,
          'utf-8-validate': false,
        },
      },
    },
  },
  // Second argument: Environment-specific configurations
  {
    production: {
      rspackConfigOverrides: {
        mode: 'production',
      },
      options: {
        budgets: [
          {
            type: 'initial',
            maximumWarning: '5mb',
            maximumError: '5mb',
          },
          {
            type: 'anyComponentStyle',
            maximumWarning: '20kb',
            maximumError: '40kb',
          },
        ],
        outputHashing: 'all',
        devServer: {},
        prerender: {
          discoverRoutes: true,
          routes: [],
        },
      },
    },
    // Merged and corrected development configuration
    development: {
      rspackConfigOverrides: {
        mode: 'development',
        optimization: {
          minimize: false,
          moduleIds: 'named',
          chunkIds: 'named',
          mangleExports: false,
          removeAvailableModules: false,
          removeEmptyChunks: false,
          splitChunks: {
            chunks: 'async',
            minSize: 30000,
          },
        },
        cache: true,
        performance: {
          hints: false,
        },
        stats: 'errors-warnings',
      },
      options: {
        sourceMap: true,
        vendorChunk: true,
        extractLicenses: false,
        namedChunks: true,
        optimization: {
          styles: {
            minify: false,
            inlineCritical: false,
          },
        },
        devServer: {
          liveReload: true,
          host: 'localhost',
          port: 4200,
        },
        prerender: {
          discoverRoutes: true,
          routes: [],
        },
      },
    },
  }
);