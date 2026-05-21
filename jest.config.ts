// jest.config.ts
import type { Config } from 'jest'

const config: Config = {
  // Entorno de prueba: 'jsdom' simula un entorno de navegador para pruebas de UI.
  testEnvironment: 'jsdom',

  // Proveedor de cobertura: 'v8' es moderno y recomendado.
  coverageProvider: 'v8',

  // Preset para TypeScript: 'ts-jest' se encarga de la transpilación.
  preset: 'ts-jest',

  // Archivos de setup que se ejecutan una vez por archivo de prueba, después de configurar el entorno.
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // Mapeador de módulos para resolver alias y mockear assets.
  moduleNameMapper: {
    // Alias de ruta: debe coincidir con tu tsconfig.json "paths"
    '^@/(.*)$': '<rootDir>/src/$1',
    // '^@shared/(.*)$': '<rootDir>/shared/$1', // Si tienes otros alias

    // Mock para archivos de estilo
    '\\.(css|scss|sass)$': 'identity-obj-proxy',

    // Mock para assets estáticos
    '\\.(jpg|jpeg|png|gif|webp|svg|eot|otf|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/tests/__mocks__/fileMock.js',
  },

  transform: {
    // Este patrón '^.+\\.(ts|tsx)$' le dice a Jest que use 'ts-jest'
    // para todos los archivos .ts y .tsx.
    // Las opciones para ts-jest van como segundo elemento del array.
    '^.+\\.(ts|tsx)$': [
      // Si solo quieres .tsx, puedes poner '^.+\\.tsx$'
      'ts-jest',
      {
        // Opciones que antes estaban en globals['ts-jest']
        babelConfig: true, // Si necesitas que Babel procese después de TS (para JSX preserve, etc.)
        tsconfig: '<rootDir>/tsconfig.jest.json', // RECOMENDADO: Usar un tsconfig separado para Jest
        // Otras opciones de ts-jest que puedas necesitar:
        // isolatedModules: true, // Puede acelerar la transpilación pero sacrifica chequeo de tipos
        // diagnostics: { ignoreCodes: ['TS151001'] } // Para ignorar ciertos errores de diagnóstico de TS
      },
    ],
    // Si tuvieras otros transformadores (ej. para archivos .js con babel-jest), irían aquí:
    // '^.+\\.(js|jsx)$': 'babel-jest',
  },

  // Patrón para encontrar archivos de prueba: solo .test.tsx dentro de src/
  testMatch: ['<rootDir>/src/**/*.test.tsx'],

  // Ignorar transformaciones para node_modules (ts-jest lo hace por defecto)
  // transformIgnorePatterns: ['/node_modules/'],

  // Ignorar carpetas al buscar módulos o durante el watch
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/.modern.js/'],

  // Configuración de Cobertura de Código
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['json', 'lcov', 'text', 'html'], // Formatos de reporte

  // Limpiar mocks automáticamente antes de cada prueba
  clearMocks: true,

  // Directorios donde Jest buscará módulos
  moduleDirectories: ['node_modules', 'src'],

  // Opcional: Si tus pruebas son lentas, puedes ajustar esto
  maxWorkers: 4, // O un número específico como 4
  // Reportes de pruebas: configuración de reportes de Jest.

  // Configuración de Reportes
  reporters: [
    'default',
    [
      '@casualbot/jest-sonar-reporter',
      {
        relativePaths: true,
        outputName: 'test-report.xml',
      },
    ],
  ],
}

export default config
