// modern.config.ts
import { appTools, defineConfig } from '@modern-js/app-tools'
import { moduleFederationPlugin } from '@module-federation/modern-js'

const normalizeAssetPrefix = (value?: string | null) => {
  if (!value || value === 'auto') {
    return 'http://localhost:3001/'
  }

  return value.endsWith('/') ? value : `${value}/`
}

const assetPrefix = normalizeAssetPrefix(
  process.env.MODERN_APP_ASSET_PREFIX || process.env.MODERN_APP_REMOTE_PUBLIC_PATH
)

export default defineConfig({
  runtime: { router: true },
  dev: {
    port: 3001,
    host: 'localhost', // Forzamos consistencia
  },
  server: {
    ssr: false,
    // El puerto se define preferiblemente en dev.port, pero dejarlo aquí está ok
  },
  plugins: [appTools({ bundler: 'webpack' }), moduleFederationPlugin()],
  resolve: {
    alias: {
      '@': './src', // Simplificado
    },
  },

  output: {
    // Asegura que el host siempre recibe URLs absolutas hacia este remoto
    assetPrefix,
    copy: [{ from: './public', to: './' }],
  },

  tools: {
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
            // ... tus configuraciones de splitChunks
          },
        }
      }

      return config
    },
  },
})
