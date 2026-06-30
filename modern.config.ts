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

const apiGatewayTarget = process.env.MODERN_APP_API_GATEWAY_TARGET || 'https://sgc-dev.coppel.io'
const supplierDsTarget =
  process.env.MODERN_APP_SUPPLIER_DS_TARGET || 'https://suppliers-dev.coppel.io'
const apiAuthToken = process.env.MODERN_APP_API_AUTH_TOKEN

const buildProxyConfig = (target: string) => ({
  target,
  changeOrigin: true,
  secure: true,
  onProxyReq: (proxyReq: { setHeader: (name: string, value: string) => void }) => {
    if (apiAuthToken) {
      proxyReq.setHeader('Authorization', `Bearer ${apiAuthToken}`)
    }
  },
})

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
      proxy: {
        '/ps': buildProxyConfig(apiGatewayTarget),
        '/ds': buildProxyConfig(supplierDsTarget),
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
