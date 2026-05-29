// modern.config.ts
import { appTools, defineConfig } from '@modern-js/app-tools'
import { moduleFederationPlugin } from '@module-federation/modern-js'
import { RESPONSE_SECURITY_HEADERS } from './src/config/securityHeaders'

const normalizeAssetPrefix = (value?: string | null) => {
  if (!value || value === 'auto') {
    return 'http://localhost:3006/'
  }

  return value.endsWith('/') ? value : `${value}/`
}

const assetPrefix = normalizeAssetPrefix(
  process.env.MODERN_APP_ASSET_PREFIX || process.env.MODERN_APP_REMOTE_PUBLIC_PATH
)

export default defineConfig({
  runtime: { router: true },
  dev: {
    port: 3006,
  },
  server: {
    ssr: false,
  },
  plugins: [appTools({ bundler: 'webpack' }), moduleFederationPlugin()],
  resolve: {
    alias: {
      '@': './src',
    },
  },

  output: {
    assetPrefix,
    copy: [{ from: './public', to: './' }],
  },

  tools: {
    devServer: {
      headers: {
        ...RESPONSE_SECURITY_HEADERS,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    },
    webpack: (config, { env }) => {
      config.output = config.output || {}
      config.output.publicPath = assetPrefix

      config.watchOptions = {
        ...(config.watchOptions || {}),
        ignored: /node_modules/,
      }

      if (env === 'production') {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: 'all',
          },
        }
      }

      return config
    },
  },
})
