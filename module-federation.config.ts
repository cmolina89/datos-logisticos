import { createModuleFederationConfig } from '@module-federation/modern-js'

// Obtener URLs desde variables de entorno con fallbacks
const HOST_URL = process.env.MODERN_APP_HOST_URL || 'http://localhost:8081/mf-manifest.json'

export default createModuleFederationConfig({
  // 1. Nombre del remoto. Debe coincidir con el del host.
  name: 'com_sgc_mfe_logisticspackagingconfig',

  // 2. Componentes que este microfrontend expone.
  exposes: {
    // Exposición del componente principal del remote
    './RemotePage': './src/components/RemotePage/RemotePage.tsx',
  },

  // 3. Acceso al store compartido del host (opcional)
  remotes: {
    // Acceso al host para usar componentes compartidos usando variable de entorno
    //host: host@${HOST_URL},
  },
  dts: false,
  // 3. Dependencias compartidas.
  shared: {
    react: {
      singleton: true,
      eager: false,
      requiredVersion: false,
    },
    'react-dom': {
      singleton: true,
      eager: false,
      requiredVersion: false,
    },
    // Dependencias de UI compartidas
    primereact: {
      singleton: true,
      eager: false,
    },
    primeicons: {
      singleton: true,
      eager: false,
    },
    primeflex: {
      singleton: true,
      eager: false,
    },
    // Router compartido
    '@modern-js/runtime/router': {
      singleton: true,
      eager: false,
    },
    // Estado compartido
    jotai: {
      singleton: true,
      eager: false,
      // requiredVersion: '^2.15.0',
    },
    // HTTP client compartido
    axios: {
      singleton: true,
      eager: false,
      // requiredVersion: '^1.12.2',
    },
    // Estilos compartidos
    'coltrane-css': {
      singleton: true,
      eager: false,
    },
    'coltrane-icon-font': {
      singleton: true,
      eager: false,
    },
  },

  // 4. Configuración adicional para mejorar la carga de chunks
  runtimePlugins: ['./src/mf-runtime-plugin.ts'],
})
