# MFE Logistics Packaging Config - Configuración de Empaque Logístico

[![ModernJS](https://img.shields.io/badge/ModernJS-2.69.5-red.svg)](https://modernjs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![PrimeReact](https://img.shields.io/badge/PrimeReact-10.9.7-orange.svg)](https://primereact.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue.svg)](https://react.dev/)
[![Coltrane](https://img.shields.io/badge/ColtraneCSS-3.0.0-yellow.svg)](https://coltrane.coppel.com/)

**Versión: 1.2.0** | **Tipo: Microfrontend (MFE) Remoto** | **Puerto: 3006**

¡Bienvenido! Este es un **Microfrontend remoto** que forma parte de la **Súper-Aplicación de Logística de Coppel**. Su propósito es proporcionar una suite completa de herramientas para configurar y gestionar aspectos críticos del empaque logístico, incluyendo datos logísticos, configuraciones de empaque, documentación del servidor y ejemplos de consumo de APIs.

Este MFE está construido siguiendo el **Estándar de Desarrollo Frontend de Coppel**, utilizando las mejores prácticas de render híbrido (SSR + CSR), arquitectura por features, Module Federation y testing integral.

---

## 📜 Tabla de Contenidos

1.  [**Acerca de este MFE**](#1-acerca-de-este-mfe)
2.  [**Primeros Pasos: Instalación y Entorno**](#2-primeros-pasos-instalación-y-entorno)
3.  [**Arquitectura y Estructura del Proyecto**](#3-arquitectura-y-estructura-del-proyecto)
4.  [**Features del Proyecto**](#4-features-del-proyecto)
5.  [**Configuración de Module Federation**](#5-configuración-de-module-federation)
6.  [**Guías de Desarrollo Esenciales**](#6-guías-de-desarrollo-esenciales)
7.  [**Estrategia de Pruebas**](#7-estrategia-de-pruebas)
8.  [**Variables de Entorno**](#8-variables-de-entorno)
9.  [**SEO y Accesibilidad**](#9-seo-y-accesibilidad)
10. [**Contribución y Licencia**](#10-contribución-y-licencia)

---

## 1. Acerca de este MFE

### ¿Qué es este Proyecto?

Este es un **Microfrontend Remoto** que forma parte de la arquitectura de Module Federation de Coppel. Específicamente, proporciona funcionalidades para la gestión de **configuración y datos logísticos de empaque**.

**Características Principales:**

-   **Datos Logísticos de Empaque:** Gestión centralizada de información logística relacionada con la configuración de empaque.
-   **Ejemplo de Consumo de API:** Implementación funcional de llamadas a APIs externas con SSR habilitado.
-   **Información de Servidor:** Página de diagnóstico para verificar configuración SSR.
-   **Sistema de Autenticación:** Control de acceso mediante cookies y Jotai.
-   **Totalmente Tipado:** TypeScript 5.9.3 con tipos estrictos en toda la base de código.

### Tecnologías Principales

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| **Modern.js** | 2.69.5 | Framework base con SSR y Module Federation |
| **React** | 19.2.3 | Librería UI |
| **TypeScript** | 5.9.3 | Lenguaje tipado |
| **Jotai** | 2.16.0 | Gestión de estado global |
| **PrimeReact** | 10.9.7 | Componentes UI |
| **Axios** | 1.13.2 | Cliente HTTP |
| **Jest** | 30.2.0 | Testing unitario |
| **Playwright** | 1.57.0 | Testing E2E |
| **Biome** | 2.3.10 | Linting y formateo |

### Información de Deploymento

| Ambiente | Puerto Local | Ruta Remota |
|----------|--------------|------------|
| **Desarrollo** | `3006` | `http://localhost:3006/remoteEntry.js` |
| **Producción** | Variable | Configurado en CI/CD |

## 2. Primeros Pasos: Instalación y Entorno

### Requisitos Previos

Asegúrate de tener instalado el siguiente software en tu máquina:

-   **Node.js:** Versión `20.x` o superior (requerido por las dependencias actuales). Se recomienda usar un gestor de versiones como [nvm](https://github.com/nvm-sh/nvm) para manejar diferentes versiones de Node.js.
-   **pnpm:** Se recomienda uses `pnpm` como gestor de paquetes (versión `8.x` o superior).
-   **Git:** Para el control de versiones.

### Instalación y Ejecución

1.  **Obtén el código:** Clona este repositorio desde Azure DevOps.
    ```bash
    git clone https://Coppel-Retail@dev.azure.com/Coppel-Retail/Logistics/_git/com-sgc-mfe-LogisticsPackagingConfig_2
    cd com-sgc-mfe-LogisticsPackagingConfig_2
    ```
2.  **Instala las dependencias:** Este proyecto utiliza `pnpm` como gestor de paquetes.
    ```bash
    pnpm install
    ```
    Alternativamente, si usas npm:
    ```bash
    npm install
    ```
3.  **Inicia el servidor de desarrollo:**
    ```bash
    pnpm dev
    ```
    o
    ```bash
    npm run dev
    ```
    El MFE estará disponible en `http://localhost:3006` con *Hot-Reloading*. El archivo `remoteEntry.js` se servará en `http://localhost:3006/remoteEntry.js` para su integración con la host app.

### Scripts Clave del Proyecto

El archivo `package.json` contiene una serie de scripts preconfigurados para facilitar las tareas comunes de desarrollo:

| Script                 | Descripción                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| ``pnpm dev``           | Inicia el MFE en modo desarrollo (puerto 3006) con remoteEntry.js exportado.                                |
| ``pnpm build``         | Compila y optimiza el MFE para producción. Genera la carpeta `dist/` con Module Federation.                 |
| ``pnpm start``         | Ejecuta el MFE en modo producción (requiere un `build` previo).                                             |
| ``pnpm serve``         | Sirve el build generado localmente para testing previo a deploymento.                                       |
| ``pnpm lint``          | Analiza el código en busca de errores de estilo y calidad usando Biome.                                     |
| ``pnpm format``        | Formatea automáticamente todo el código para que cumpla con las reglas de estilo de Biome.                  |
| ``pnpm test``          | Ejecuta todas las pruebas unitarias y de integración con Jest.                                              |
| ``pnpm test:unit``     | Ejecuta las pruebas unitarias con cobertura de código.                                                      |
| ``pnpm test:watch``    | Ejecuta las pruebas en "modo observador", volviéndolas a correr automáticamente al detectar cambios.        |
| ``pnpm coverage``      | Ejecuta las pruebas y genera un reporte de cobertura de código.                                             |
| ``pnpm e2e``           | Ejecuta las pruebas End-to-End con Playwright en modo headless (sin interfaz gráfica).                      |
| ``pnpm e2e:ui``        | Abre la potente interfaz de usuario de Playwright para ejecutar y depurar pruebas E2E de forma visual.      |
| ``pnpm upgrade``       | Actualiza las dependencias de Modern.js a la última versión.                                                |
| ``pnpm reset``         | Elimina node_modules para poder hacer una reinstalación limpia de las dependencias.                         |
| ``pnpm clean``         | Limpia dist, .modern.js y node_modules para un reseteo completo.                                           |

## 3. Arquitectura y Estructura del Proyecto

### Estructura de Directorios

Al iniciar un proyecto con esta plantilla, encontrarás la siguiente estructura de directorios. Todo el código de tu aplicación reside dentro de la carpeta ``src/``.

```bash
/
├── public/                          # Archivos estáticos (favicons, temas CSS, remoteEntry.js)
├── src/                             # CÓDIGO FUENTE DEL MFE
│   ├── app/                         # Lógica y configuración global (Providers, Store)
│   ├── components/                  # Componentes UI GENÉRICOS reutilizables
│   ├── features/                    # 🎯 Features específicas del MFE:
│   │   ├── authFeature/            # Autenticación y control de acceso
│   │   ├── datosLogisticosEmpaqueFeature/  # ⭐ Feature principal: Datos logísticos de empaque
│   │   ├── postsFeature/           # Ejemplo funcional de consumo de API
│   │   └── serverDocsFeature/      # Página de diagnóstico SSR
│   ├── hooks/                       # Hooks personalizados (useBreakpoint, useSEO, etc.)
│   ├── lib/                         # Clientes configurados (httpClient)
│   ├── routes/                      # Definición de páginas y rutas (convención Modern.js)
│   ├── styles/                      # Archivos SCSS globales (variables, temas)
│   ├── types/                       # Definiciones de tipos TypeScript globales
│   └── utils/                       # Funciones utilitarias
├── tests/                           # Pruebas E2E con Playwright
├── module-federation.config.ts      # Configuración de Module Federation
├── modern.config.ts                 # Configuración principal de Modern.js
├── jest.config.ts                   # Configuración de Jest
└── package.json                     # Dependencias y scripts
```

### La Arquitectura por "Features"

La estrategia principal es la **arquitectura por features**. Los archivos se agrupan por **funcionalidad de negocio**, no por tipo de archivo.

**Ventajas:**
-   **Cohesión:** Todo lo relacionado con una funcionalidad está junto.
-   **Bajo Acoplamiento:** Cada feature es independiente.
-   **Escalabilidad:** Añadir nuevas funcionalidades es simple y limpio.

## 4. Features del Proyecto

Este MFE incluye cuatro features principales:

### 4.1 `authFeature` - Sistema de Autenticación

Sistema de autenticación simulado con integración real de cookies y Jotai.

**Ubicación:** `src/features/authFeature/`

**Características:**
- Flujo de login/logout con cookies
- Estado global persistente
- HOC `withAuthentication` para proteger rutas
- Validación de tokens en peticiones HTTP

**Rutas asociadas:**
- `/login` - Página de autenticación

---

### 4.2 `datosLogisticosEmpaqueFeature` - Datos Logísticos de Empaque ⭐

**Esta es la feature principal del MFE.** Gestiona toda la información logística relacionada con empaque.

**Ubicación:** `src/features/datosLogisticosEmpaqueFeature/`

**Características:**
- Gestión de parámetros de empaque
- Validación de datos logísticos
- Integración con APIs de backend
- Almacenamiento en estado global
- Soporte SSR para SEO

**Rutas asociadas:**
- `/datos-logisticos-empaque/*` - Rutas específicas de empaque

---

### 4.3 `postsFeature` - Ejemplo Funcional de API

Implementación completa de consumo de API externa con SSR, lazy loading y manejo de estados.

**Ubicación:** `src/features/postsFeature/`

**Características:**
- Consumo de la API JSONPlaceholder (externa)
- Loader SSR para precarga de datos
- Estado de carga, error y éxito
- Code splitting automático
- Demostración de buenas prácticas

**Rutas asociadas:**
- `/posts` - Lista de posts (requiere autenticación)

**Tecnologías demostrables:**
- Uso de `useLoaderData()` para SSR
- Axios con interceptores
- Jotai para estado
- Error handling

---

### 4.4 `serverDocsFeature` - Diagnóstico SSR

Página interactiva para verificar la configuración SSR y debuggear problemas de renderizado.

**Ubicación:** `src/features/serverDocsFeature/`

**Características:**
- Información del servidor (Node.js version, hora, entorno)
- Validación del setup SSR
- Explicación visual del flujo de renderizado
- Útil para debugging en desarrollo

**Rutas asociadas:**
- `/server-side-info` - Página de diagnóstico

---

## 5. Configuración de Module Federation

Este MFE está configurado como un **remote** en la arquitectura Module Federation. Esto significa que puede ser consumido como un módulo desde una aplicación "host".

### Archivo de Configuración

```typescript
// modern.config.ts
export default defineConfig({
  dev: {
    port: 3006,  // Puerto de desarrollo
  },
  plugins: [appTools(), moduleFederationPlugin()],
  output: {
    assetPrefix,  // URL pública del MFE
    copy: [{ from: './public', to: './' }],
  },
})
```

### Integración con Host App

**En la aplicación host**, configura este MFE como remoto:

```typescript
remotes: {
  'com-sgc-mfe-logisticspackagingconfig': 'https://logistics-packaging.tu-dominio.com/remoteEntry.js'
}
```

**En desarrollo local:**
```typescript
remotes: {
  'com-sgc-mfe-logisticspackagingconfig': 'http://localhost:3006/remoteEntry.js'
}
```

### Consumir Componentes del MFE

Desde la host app, puedes importar componentes del MFE:

```tsx
import { LogisticsPackagingPage } from 'com-sgc-mfe-logisticspackagingconfig/components'

export function App() {
  return <LogisticsPackagingPage />
}
```

### Recursos Generados

Al ejecutar `npm run build`, se generan:

- `dist/remoteEntry.js` - Punto de entrada Module Federation (OBLIGATORIO para host app)
- `dist/` - Resto de bundled chunks y assets
- `dist/manifest.json` - Metadatos del MFE

---

## 6. Guías de Desarrollo Esenciales

### Renderizado: ¿Cuándo y Cómo Usar SSR?

Este estándar utiliza un **enfoque híbrido** donde la carga inicial de una página se hace en el servidor (SSR) y la navegación posterior en el cliente (CSR). Modern.js gestiona esto de forma inteligente basándose en una convención de archivos.

**Para activar SSR en una ruta, sigue estos dos pasos:**

1.  **Crea el archivo de datos:** Junto a tu archivo de página (ej. ``src/routes/mi-ruta/page.tsx``), crea un archivo llamado ``src/routes/mi-ruta/page.data.tsx``.
2.  **Exporta un `loader`:** Dentro de ``page.data.tsx``, exporta una función asíncrona llamada `loader`.

```tsx
// src/routes/mi-ruta/page.data.tsx
export const loader = async () => {
  // Este código se ejecuta SOLO en el servidor Node.js
  const response = await fetch('https://api.coppel.com/mi-endpoint');
  const data = await response.json();
  return data; // Los datos devueltos estarán disponibles en el componente
};
```

El componente en ``page.tsx`` puede acceder a estos datos usando el hook ``useLoaderData()``. Si una ruta **no** tiene un archivo `page.data.tsx`, se renderizará completamente en el cliente (CSR).

**Importante:** El código en el servidor **no tiene acceso** a APIs del navegador como `window` o `localStorage`. Usa la utilidad ``isServer`` de ``src/utils/environment.ts`` para ejecutar código condicionalmente y evitar errores.

### Manejo de Estado con Jotai

Para el estado global, usamos **Jotai** por su simplicidad y rendimiento.

-   **Átomos:** Un átomo es la unidad mínima de estado (piensa en un `useState` que se puede compartir). Se definen usando `atom()`.

```tsx
import { atom } from 'jotai';
export const contadorAtom = atom(0);
```

-   **Uso en Componentes:** Se utilizan los hooks `useAtom`, `useAtomValue` (solo lectura) y `useSetAtom` (solo escritura).

```tsx
const [contador, setContador] = useAtom(contadorAtom);
```

-   **Persistencia:** Para guardar estado en `localStorage` (como la preferencia de tema), la plantilla usa ``atomWithStorage`` de ``jotai/utils``. Esta utilidad ya está configurada de forma segura para no fallar durante el SSR.

### Estilos y Sistema de Temas

-   **Tokens de Diseño:** Las variables de marca (colores, fuentes, espaciados) se definen como variables CSS en los archivos SCSS. Estas son la única fuente de verdad para el diseño visual.
-   **Sistema de Temas:** El MFE incluye un switch de tema (claro/oscuro) que actualiza dinámicamente tanto las variables CSS como el tema de PrimeReact.
-   **Layouts Responsivos:** Usa las clases de utilidad de **PrimeFlex** (ej. ``p-d-flex``, ``p-jc-between``, ``p-col-12``, ``p-md-6``) para construir layouts que se adapten a diferentes pantallas.

### Peticiones a APIs con Axios

-   **Instancia Centralizada:** Utiliza siempre la instancia de Axios configurada en ``src/lib/httpClient.ts``. No crees nuevas instancias.
-   **Interceptores:** Esta instancia ya incluye interceptores para:
    -   **Request Interceptor:** Añade automáticamente el token de autenticación (si existe en las cookies) a las cabeceras de cada solicitud.
    -   **Response Interceptor:** Maneja errores HTTP comunes de forma centralizada.

## 7. Estrategia de Pruebas

Una aplicación de calidad se apoya en una sólida estrategia de pruebas. La plantilla viene preconfigurada para facilitar este proceso.

### Pruebas Unitarias y de Integración (Jest + RTL)

-   **Objetivo:** Probar componentes y funciones de forma aislada. Nos centramos en probar el comportamiento que el usuario ve, no los detalles de implementación.
-   **Convención:** Los archivos de prueba deben terminar en ``.test.tsx``. Se recomienda colocarlos junto al componente o función que están probando.
-   **Configuración:** Definida en ``jest.config.ts``. Utiliza `ts-jest` para transformar TypeScript y está configurada para generar reportes de cobertura.
-   **Ejecución:**
    -   ``npm test``: Corre todas las pruebas.
    -   ``npm run test:watch``: Modo observador para desarrollo.
    -   ``npm run coverage``: Genera un reporte en la carpeta ``/coverage``.

### Pruebas End-to-End (Playwright)

-   **Objetivo:** Probar flujos de usuario completos, de principio a fin, simulando la interacción real en un navegador.
-   **Convención:** Los archivos de prueba deben terminar en ``.spec.ts`` y vivir en la carpeta ``/tests/e2e/`` en la raíz del proyecto.
-   **Configuración:** Definida en ``playwright.config.ts``.
-   **Ejecución:**
    -   ``npm run e2e``: Corre las pruebas en modo "headless" (sin interfaz gráfica), ideal para pipelines de CI/CD.
    -   ``npm run e2e:ui``: Abre la potente interfaz de usuario de Playwright para ejecutar y depurar pruebas de forma visual, una herramienta excelente para el desarrollo.

## 8. Variables de Entorno

Las variables de entorno permiten configurar el comportamiento del MFE en diferentes ambientes (desarrollo, staging, producción).

### Configuración de Variables

**Archivo base:** `/.env` (crea este archivo en la raíz del proyecto)

**Variables importantes:**

```bash
# ===== ASSET PREFIX (OBLIGATORIO PARA PRODUCCIÓN) =====
# URL pública donde se servará el remoteEntry.js en producción
MODERN_APP_REMOTE_PUBLIC_PATH=https://logistics-packaging-prod.coppel.com/

# En desarrollo local (opcional, por defecto es http://localhost:3006/)
# MODERN_APP_ASSET_PREFIX=http://localhost:3006/

# ===== APIs EXTERNAS =====
# Endpoint de la API de logística
MODERN_APP_API_LOGISTICS_ENDPOINT=https://api.coppel.com/logistics/v1

# Endpoint de datos de empaque
MODERN_APP_API_PACKAGING_ENDPOINT=https://api.coppel.com/packaging/v1

# Timeout para peticiones HTTP (en ms)
MODERN_APP_API_TIMEOUT=30000

# ===== CONFIGURACIÓN DE APLICACIÓN =====
# Ambiente actual
MODERN_APP_ENV=development

# Modo debug
MODERN_APP_DEBUG=false
```

### Distinción: Cliente vs Servidor

- **Variables del Cliente:** Deben tener el prefijo `MODERN_APP_` para estar disponibles en el navegador.
- **Variables del Servidor:** Cualquier otra variable solo está disponible en Node.js (dentro de `page.data.tsx`).

### Ejemplo de Uso en Código

```tsx
// En el cliente
const apiUrl = process.env.MODERN_APP_API_LOGISTICS_ENDPOINT

// En el servidor (page.data.tsx)
export const loader = async () => {
  const token = process.env.API_SECRET_TOKEN  // Variable solo servidor
  const endpoint = process.env.MODERN_APP_API_LOGISTICS_ENDPOINT
  // ...
}
```

---

---

## 9. SEO y Accesibilidad

### SEO (Optimización para Motores de Búsqueda)

SEO es el proceso de mejorar la visibilidad de un sitio web en los resultados de búsqueda. En este MFE:

- **Renderizado en Servidor (SSR):** Los datos se precargan en el servidor, generando HTML completo que los motores de búsqueda pueden indexar inmediatamente.
- **Metadatos:** Utiliza el componente `SEOHead` para definir títulos, descripciones y palabras clave por ruta.
- **URLs Limpias:** Las rutas están organizadas de forma semántica para mejorar SEO.

### Accesibilidad

La accesibilidad web asegura que el MFE sea utilizable por personas con discapacidades:

- **Etiquetas Semánticas:** Usa `<article>`, `<section>`, `<nav>`, etc.
- **Atributos `alt`:** Todas las imágenes tienen descripciones en `alt`.
- **Navegación por Teclado:** Todos los componentes interactivos son accesibles sin ratón.
- **Contraste de Color:** Cumple con estándares WCAG 2.1 AA.
- **ARIA Labels:** Usa atributos `aria-*` cuando es necesario.

## 10. Contribución y Licencia

### Guía de Contribución

Este proyecto es parte del ecosistema de Coppel y sigue un flujo de contribución estándar:

**Flujo de Contribución:**

1.  **Abrir un Issue:** Antes de realizar un cambio significativo, abre un "issue" en Azure DevOps para discutir la propuesta, el bug o la mejora.
2.  **Crear una rama:**
    ```bash
    git checkout -b feature/mi-nueva-funcionalidad
    ```
3.  **Realizar cambios y commits:**
    ```bash
    git add .
    git commit -m "feat: agregar nueva funcionalidad de empaque"
    ```
4.  **Asegurar calidad:**
    ```bash
    pnpm lint      # Verificar errores de linting
    pnpm format    # Formatear código
    pnpm test      # Ejecutar pruebas
    pnpm build     # Verificar que el build es exitoso
    ```
5.  **Push y Pull Request:**
    ```bash
    git push origin feature/mi-nueva-funcionalidad
    ```
    - Actualiza el `CHANGELOG.md` siguiendo el formato establecido
    - Describe los cambios en la PR
    - Espera revisión del equipo

### Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar nueva funcionalidad
fix: corregir bug
docs: actualizar documentación
style: cambios de formato
refactor: refactorizar código
test: agregar pruebas
chore: actualizar dependencias
```

### Licencia

Este proyecto y su plantilla se distribuyen bajo la **Licencia ISC**. Puedes encontrar el texto completo en el archivo `LICENSE` del repositorio.

---

## 📚 Apéndice: Enlaces y Recursos Útiles

Para profundizar en las tecnologías utilizadas en este MFE, consulta la documentación oficial:

*   **Frameworks y Librerías Principales:**
    *   [**Modern.js** - Documentación Oficial](https://modernjs.dev/)
    *   [**React** - Nueva Documentación](https://react.dev/)
    *   [**TypeScript** - Manual Oficial](https://www.typescriptlang.org/docs/)
    *   [**Jotai** - Documentación y API](https://jotai.org/docs/introduction)
    *   [**PrimeReact** - Documentación de Componentes](https://primereact.org/)
    *   [**PrimeFlex** - Documentación de Clases de Utilidad](https://www.primefaces.org/primeflex/)

*   **Herramientas y Pruebas:**
    *   [**Axios** - Documentación en GitHub](https://axios-http.com/)
    *   [**Jest** - Guía de Inicio](https://jestjs.io/docs/getting-started)
    *   [**React Testing Library** - Documentación Principal](https://testing-library.com/docs/react-testing-library/intro)
    *   [**Playwright** - Documentación Oficial](https://playwright.dev/docs/intro)
    *   [**Biome** - Documentación del Linter y Formateador](https://biomejs.dev/docs/)
    *   [**react-cookie** - Documentación en GitHub](https://github.com/react-hook/react-cookie)

*   **Conceptos Clave y Estándares:**
    *   [**Module Federation** - Webpack Documentation](https://webpack.js.org/concepts/module-federation/)
    *   [**Keep a Changelog** - Formato para CHANGELOG.md](https://keepachangelog.com/en/1.0.0/)
    *   [**Semantic Versioning (SemVer)** - Especificación](https://semver.org/spec/v2.0.0.html)
    *   [**Conventional Commits** - Especificación](https://www.conventionalcommits.org/)

---

**Autor:** Equipo de Arquitectura Digital - Coppel  
**Última Actualización:** 2026-05-15  
**Estado:** Mantenido Activamente
