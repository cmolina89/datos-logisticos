
---

**2. `CHANGELOG.md`**

```markdown
# Changelog

Todos los cambios notables a este proyecto serán documentados en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (sugerido).

**Tipos de cambios**

-   `Added` para funcionalidades nuevas.
-   `Changed` para los cambios en funcionalidades existentes.
-   `Deprecated` para indicar que una funcionalidad está obsoleta, se queda sin soporte y se eliminará en próximas versiones.
-   `Removed` para las funcionalidades en desuso que se eliminaron en esta versión.
-   `Fixed` para corrección de errores.
-   `Security` en caso de vulnerabilidades.

---
## [1.2.1] - 2025-17-12

### Changed

-   **Actualización de dependencias** Se actualizaron dependencias por temas de vulnerabildades con el core React, se tomó la decisión de subir a React 19, esperemos no haya problemas!

## [1.2.0] - 2025-10-10

### Changed

-   **Actualización de dependencias** Se actualizaron dependencias para evitar error con webpack al momento de compilar 
-   **Modificación de estilos globales mejorando responsive** Se mejoraron los estilos para buscar aprovechar mejor las diferentes pantallas

## [1.0.0] - 2025-25-07

### Added

-   **Mejoras de SSR, SEO Y Accesibilidad:** Se hicieron considerables mejoras en temas  de SSR, SEO y Accesibilidad mejorando bastante la calificación en herramienta Lighthouse
-   **Utilidad de Detección de Entorno:** Creado el archivo ``src/utils/environment.ts`` que exporta las constantes ``isServer`` e ``isBrowser`` para ser reutilizadas en toda la aplicación, facilitando la escritura de código universal (seguro para SSR).
-   **Documentación de Renderizado Avanzada:**
    -   Creada una nueva ruta de documentación ``/server-side-info`` para explicar en detalle el funcionamiento del SSR y CSR en la plantilla.
    -   La página detecta el modo de renderizado actual y muestra contenido específico para cada caso.
    -   Se explica el rol de los archivos ``page.tsx`` y ``page.data.tsx`` según la convención de Modern.js.

### Changed

-   **Refactorización de Estado Global:** Actualizados los archivos de átomos de Jotai (``themeAtoms.ts`` y ``authAtoms.ts``) para utilizar la nueva utilidad ``isServer``, haciendo su inicialización y manejo de ``localStorage`` completamente seguros para SSR.

### Fixed

-   **Solucionado problema de SSR:** Resuelto el problema fundamental por el cual el `loader` de datos del servidor no se ejecutaba o sus datos no se propagaban al cliente. La solución se basó en adoptar la convención de Modern.js de separar la lógica del `loader` en un archivo ``page.data.tsx``.

## [0.1.1] - 2025-06-26

### Changed

-   **Cambios en carpeta Dist** Se elimino la carpeta html de la carpeta dist y el archivo index.html pasó a estar en la raíz de /dist
-   **Actualización de React** Se realizó la actualización de las dependencias React

## [0.1.0] - 2025-06-23

### Added

-   **Inicialización del Proyecto:** Creación de la plantilla base `CoppelFramework - WebClient React` utilizando Modern.js.
-   **Stack Tecnológico Principal:**
    -   Integración de React, TypeScript.
    -   Configuración de SASS/SCSS para estilos.
    -   Añadido PrimeReact para componentes UI y PrimeFlex para utilidades de layout.
    -   Integración de Jotai para el manejo de estado global.
    -   Añadido Axios para peticiones HTTP.
-   **Estructura de Proyecto:** Definición del scaffolding inicial con arquitectura orientada a features.
-   **Configuración de Herramientas:**
    -   Configuración de Biome para formateo y linting, con hooks pre-commit (`lint-staged`, `simple-git-hooks`).
    -   Configuración base para Jest y React Testing Library para pruebas unitarias/integración, incluyendo `setupTests.ts` y mocks de estilo.
    -   Configuración base para Playwright para pruebas E2E (requiere `playwright.config.ts` y scripts).
    -   Configuración de alias de importación (`@/*`).
-   **Funcionalidad de Ejemplo:**
    -   Implementación de un switch de tema dinámico (claro/oscuro) utilizando PrimeReact (temas Lara) y Jotai, con persistencia en localStorage.
    -   Inclusión de estilos de marca base (variables CSS de Coppel) en `:root` y su integración con el sistema de temas.
-   **Documentación Inicial:**
    -   Creación de `README.md` con descripción del proyecto, stack, estructura y guías de inicio.
    -   Creación de este `CHANGELOG.md`.
    -   Añadida documentación detallada en la página de inicio (`src/routes/page.tsx`) explicando el enfoque, tecnologías, scaffolding, CSR/SSR, y el ejemplo del switch de tema.
-   **Correcciones Iniciales:**
    -   Solucionado problema de `watchpack` en Windows mediante `watchOptions.ignored` en `modern.config.ts`.
    -   Corregidos errores de parsing JSX en la documentación de la página de inicio.
    -   Ajustada la lógica de carga de temas de PrimeReact para que funcione correctamente desde la carpeta `public/themes/`.

### Changed

-   Se optó por Modern.js como framework base en lugar de Vite para un mejor soporte futuro de Microfrontends y características integradas.
-   Ajustada la ubicación de los archivos CSS de temas de PrimeReact a `public/themes/` para el correcto funcionamiento del switch de tema dinámico.
-   Actualizados nombres de archivos de rutas (`page.tsx` para el índice, `layout.tsx` para el layout global) según la implementación.
