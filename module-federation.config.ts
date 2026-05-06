import { createModuleFederationConfig } from '@module-federation/modern-js'

export default createModuleFederationConfig({
  name: 'com_sgc_mfe_logisticspackagingconfig',
  dts: false,

  // Componentes que este microfrontend expone.
  exposes: {
    './RemotePage': './src/components/RemotePage/RemotePage.tsx',
    './DatosLogisticosEmpaque':
      './src/features/datosLogisticosEmpaqueFeature/pages/DatosLogisticosEmpaquePage.tsx',
    './DatosLogisticosEmpaquePage':
      './src/features/datosLogisticosEmpaqueFeature/pages/DatosLogisticosEmpaquePage.tsx',
  },

  // Dependencias compartidas.
  shared: {
    react: {
      singleton: true,
      eager: false,
    },
    'react-dom': {
      singleton: true,
      eager: false,
    },
    '@modern-js/runtime/router': {
      singleton: true,
      eager: false,
    },
    jotai: {
      singleton: true,
      eager: false,
    },
  },

  // Configuración adicional para mejorar la carga de chunks
  runtimePlugins: ['./src/mf-runtime-plugin.ts'],
})