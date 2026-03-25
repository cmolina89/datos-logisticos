# Estándar de Desarrollo Frontend: CoppelFramework - WebClient React

[![ModernJS](https://img.shields.io/badge/ModernJS-2.69.4-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![PrimeNG](https://img.shields.io/badge/PrimeReact-10.9.7-orange.svg)](https://primereact.org/)
[![Coltrane](https://img.shields.io/badge/ColtraneCSS-3.0.0-yellow.svg)](https://coltrane.coppel.com/)

**Versión: 1.2.1**

¡Bienvenido! Este documento es la guía oficial y la fuente de verdad para el **Estándar de Desarrollo Frontend de Coppel para aplicaciones React**. Su propósito es proporcionar una base de conocimiento, herramientas y arquitecturas para construir productos digitales de alta calidad, que sean robustos, mantenibles y escalables.

Para acelerar el desarrollo y garantizar el cumplimiento de estas directrices, este estándar viene acompañado de una **plantilla de inicio** (`CoppelFramework - WebClient React`). Esta plantilla es la implementación de referencia y el punto de partida **obligatorio** para todos los nuevos proyectos web orientados al cliente externo.

---

## 📜 Tabla de Contenidos

1.  [**Visión y Enfoque Estratégico**](#1-visión-y-enfoque-estratégico)
2.  [**Primeros Pasos: Instalación y Entorno**](#2-primeros-pasos-instalación-y-entorno)
3.  [**Arquitectura y Estructura del Proyecto**](#3-arquitectura-y-estructura-del-proyecto)
4.  [**Guías de Desarrollo Esenciales**](#4-guías-de-desarrollo-esenciales)
5.  [**Ejemplos Prácticos en la Plantilla**](#5-ejemplos-prácticos-en-la-plantilla)
6.  [**Estrategia de Pruebas**](#6-estrategia-de-pruebas)
7.  [**Contribución y Licencia**](#7-contribución-y-licencia)
8.  [**SEO y Accesibilidad**](#8-seo-y-accesibilidad)
9.  [**Code Splitting**](#9-code-splitting)
10. [**Lighthouse**](#10-lighthouse)

---

## 1. Visión y Enfoque Estratégico

### ¿Por qué existe este Estándar?

El objetivo principal es simple: **construir mejores productos, más rápido y de forma unificada**. Este estándar ataca varios frentes para lograrlo:

*   **Estandarización:** Define un conjunto único de herramientas y arquitecturas. Esto significa que un programador puede moverse entre proyectos con una curva de aprendizaje mínima, ya que la base tecnológica es la misma.
*   **Productividad Acelerada:** La plantilla inicial elimina días (o incluso semanas) de configuración. Viene con todo lo necesario para empezar a desarrollar la lógica de negocio desde el primer día.
*   **Calidad Incorporada:** Fomentamos prácticas de alta calidad desde el principio, como el tipado estático con TypeScript, pruebas automatizadas, y un código bien estructurado que es más fácil de leer y mantener.
*   **Escalabilidad a Futuro:** La arquitectura no solo está pensada para el proyecto actual, sino para que pueda crecer y, eventualmente, integrarse en ecosistemas más grandes como los **microfrontends**.

### El Enfoque Híbrido: Optimizando para el Cliente

Para las aplicaciones que nuestros clientes usan, la experiencia lo es todo. Por ello, este estándar se basa en un modelo de **Renderizado Híbrido**, combinando las fortalezas de dos mundos:

-   **Server-Side Rendering (SSR):** La primera vez que un usuario o un motor de búsqueda visita una página, nuestro servidor construye el HTML completo y lo envía.
    -   **Beneficio para el Usuario:** La página se vuelve visible y utilizable casi instantáneamente. Esto reduce la tasa de rebote y mejora drásticamente la percepción de velocidad.
    -   **Beneficio para el Negocio:** Un excelente posicionamiento en Google (SEO) es crucial. Al enviar HTML completo, facilitamos que los motores de búsqueda entiendan e indexen nuestro contenido, lo que se traduce en mayor visibilidad.

-   **Client-Side Rendering (CSR):** Una vez que la aplicación ha cargado en el navegador, React toma el control. La navegación entre diferentes secciones se siente instantánea, como en una aplicación de escritorio, porque ya no se necesita recargar la página completa.

### Preparación para Microfrontends con Module Federation

Este estándar mira hacia el futuro. La elección de **Modern.js** como framework base no es casual. Modern.js tiene un soporte nativo y de primera clase para **Module Federation**, la tecnología que permite que diferentes aplicaciones (microfrontends) se compongan en una sola experiencia de usuario cohesiva.

Esto significa que un proyecto que comienza hoy como una aplicación mediana, mañana puede convertirse en una "feature" dentro de una súper-aplicación sin necesidad de reescribir todo desde cero. Dominar este estándar es prepararse para los desafíos arquitectónicos más importantes de Coppel.

## 2. Primeros Pasos: Instalación y Entorno

### Requisitos Previos

Asegúrate de tener instalado el siguiente software en tu máquina:

-   **Node.js:** Versión `18.x` o superior. Se recomienda usar un gestor de versiones como [nvm](https://github.com/nvm-sh/nvm) para manejar diferentes versiones de Node.js.
-   **npm:** Versión `8.x` o superior (generalmente viene con Node.js).
-   **Git:** Para el control de versiones.

### Instalación y Ejecución

1.  **Obtén el código:** Clona la plantilla desde el repositorio oficial de Coppel.
    ```
    git clone https://Coppel-Retail@dev.azure.com/Coppel-Retail/Frameworks_Coppel/_git/coppelframework-webclient-reactjs
    cd coppelframework-webclient-reactjs
    ```
2.  **Instala las dependencias:** Este comando leerá el `package.json` y descargará todas las librerías necesarias en la carpeta `node_modules`.
    ```
    npm install
    ```
3.  **Inicia el servidor de desarrollo:**
    ```
    npm run dev
    ```
    Este comando inicia un servidor local (generalmente en ``http://localhost:8080``) con *Hot-Reloading*, lo que significa que cada vez que guardes un cambio en tu código, la página se actualizará automáticamente en el navegador.

### Scripts Clave del Proyecto

El archivo `package.json` contiene una serie de scripts preconfigurados para facilitar las tareas comunes de desarrollo:

| Script                 | Descripción                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| ``npm run dev``        | Inicia la aplicación en modo desarrollo.                                                                    |
| ``npm run build``      | Compila y optimiza la aplicación para producción. Genera la carpeta `dist/`.                                |
| ``npm run start``      | Ejecuta la aplicación en modo producción (requiere un `build` previo).                                      |
| ``npm run lint``       | Analiza el código en busca de errores de estilo y calidad usando Biome.                                     |
| ``npm run format``     | Formatea automáticamente todo el código para que cumpla con las reglas de estilo de Biome.                  |
| ``npm test``           | Ejecuta todas las pruebas unitarias y de integración con Jest.                                              |
| ``npm run test:unit `` | Ejecuta las pruebas unitarias que encuentra en src/*.test.tsx incluyendo el coverage de las pruebas         |
| ``npm run test:watch`` | Ejecuta las pruebas en "modo observador", volviéndolas a correr automáticamente al detectar cambios.        |
| ``npm run coverage``   | Ejecuta las pruebas y genera un reporte de cobertura de código.                                             |
| ``npm run e2e``        | Ejecuta las pruebas End-to-End con Playwright en modo headless (sin interfaz gráfica).                      |
| ``npm run e2e:ui``     | Abre la potente interfaz de usuario de Playwright para ejecutar y depurar pruebas E2E de forma visual.      |
| ``npm run reset ``     | Elimina node_modules para poder hacer una reinstalación de las dependencias limpia                          |

## 3. Arquitectura y Estructura del Proyecto

Una arquitectura bien definida es la base de un software mantenible. Este estándar promueve una organización clara del código para facilitar la colaboración y el crecimiento a largo plazo.

### Entendiendo el Scaffolding

Al iniciar un proyecto con la plantilla, encontrarás una estructura de directorios predefinida. Todo el código de tu aplicación reside dentro de la carpeta ``src/``.

```bash
/
├── public/                # Archivos estáticos (favicons, temas CSS) que se copian tal cual al build.
├── src/                   # CÓDIGO FUENTE DE LA APLICACIÓN
│   ├── app/               # Lógica y configuración global de la aplicación (Providers, Store global).
│   ├── components/        # Componentes UI GENÉRICOS, reutilizables en cualquier parte de la aplicación.
│   ├── features/          # ¡EL CORAZÓN DE LA ARQUITECTURA! Módulos de negocio autocontenidos.
│   ├── hooks/             # Hooks de React personalizados y de uso global.
│   ├── lib/               # Clientes de librerías configurados (ej. instancia de Axios).
│   ├── routes/            # Definición de las páginas y su mapeo a URLs (convención de Modern.js).
│   ├── styles/            # Archivos SCSS globales (variables, resets, tema base).
│   ├── types/             # Definiciones de tipos TypeScript globales.
│   └── utils/             # Funciones de utilidad que no son hooks y son de uso general.
├── tests/                 # Pruebas End-to-End (E2E) con Playwright.
├── .env.example           # Archivo de ejemplo para variables de entorno.
├── jest.config.ts         # Configuración de Jest para pruebas unitarias/integración.
├── modern.config.ts       # Configuración principal de Modern.js (build, rutas, SSR/CSR).
└── package.json           # Dependencias y scripts del proyecto.
```

### La Arquitectura por "Features"

La estrategia principal para organizar el código es la **arquitectura por features**. En lugar de agrupar archivos por su tipo (todos los componentes en una carpeta, todos los hooks en otra), los agrupamos por la **funcionalidad de negocio** a la que pertenecen.

**¿Por qué?**
-   **Cohesión:** Todo lo relacionado con una funcionalidad (ej. "Perfil de Usuario") está junto, facilitando su localización y modificación.
-   **Bajo Acoplamiento:** Cada feature debe ser lo más independiente posible de las demás. Esto reduce el riesgo de que un cambio en una feature rompa otra inesperadamente.
-   **Escalabilidad:** Añadir nuevas funcionalidades es tan simple como crear una nueva carpeta de feature, sin "contaminar" el resto del código.

Una feature típica (ej. ``userProfile``) tendría la siguiente estructura interna:
```bash
/userProfile
├── api/          # Funciones para llamar a los endpoints de la API del perfil.
├── components/   # Componentes React que SÓLO se usan dentro de la feature del perfil.
├── hooks/        # Hooks personalizados para la lógica de esta feature (ej. `useUserProfileData`).
├── pages/        # Componentes de página completos que ensamblan los componentes de la feature.
├── store/        # Átomos de Jotai para el estado específico del perfil.
└── types/        # Tipos de TypeScript que solo conciernen a esta feature.
```

## 4. Guías de Desarrollo Esenciales

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

-   **Tokens de Diseño:** Las variables de marca (colores, fuentes, espaciados) se definen como variables CSS en ``src/styles/base/_theme-coppel.scss``. Estas son la única fuente de verdad para el diseño visual.
-   **Uso:** En tus archivos SCSS, utiliza siempre estas variables: ``background-color: var(--primary-color);``.
-   **Switch de Tema:** La plantilla incluye un switch de tema (claro/oscuro) que actualiza dinámicamente tanto las variables CSS como el tema de PrimeReact, asegurando una consistencia visual total.
-   **Layouts:** Usa las clases de utilidad de **PrimeFlex** (ej. ``p-d-flex``, ``p-jc-between``, ``p-col-12``, ``p-md-6``) para construir layouts responsivos sin escribir CSS personalizado.

### Peticiones a APIs con Axios

-   **Instancia Centralizada:** Utiliza siempre la instancia de Axios configurada en ``src/lib/axios.ts``. No crees nuevas instancias.
-   **Interceptores:** Esta instancia ya incluye interceptores para:
    -   **Request Interceptor:** Añade automáticamente el token de autenticación (si existe en las cookies) a las cabeceras de cada solicitud.
    -   **Response Interceptor:** Maneja errores HTTP comunes de forma centralizada. Por ejemplo, si una API devuelve un error `401 No Autorizado`, puede redirigir al login (lógica a implementar según necesidad).

### Variables de Entorno

-   Define tus variables en un archivo ``.env`` en la raíz (y **añádelo a ``.gitignore``**).
-   **Variables para el Cliente:** Para que una variable esté disponible en el navegador, su nombre **debe** comenzar con el prefijo **``MODERN_APP_``**.
-   **Variables para el Servidor:** Cualquier otra variable solo estará disponible en el entorno Node.js (es decir, dentro de un `loader` en un archivo `page.data.tsx`).

## 5. Ejemplos Prácticos en la Plantilla

La mejor forma de aprender el estándar es viendo cómo se aplican sus principios en la práctica. La plantilla incluye una aplicación de demostración con varias rutas que sirven como "documentación viva". Se recomienda explorar su código fuente para entender a fondo la implementación.

### Demostración 1: Ruta de Documentación Principal (`/`)

La página de inicio no es solo una bienvenida; es una versión interactiva de este mismo `README`. Sirve como un ejemplo de:
-   **Componente de Página Simple:** Estructura básica de un componente de página en ``src/routes/page.tsx``.
-   **Uso de Componentes PrimeReact:** Implementa ``<TabView>``, ``<Card>``, ``<Chip>`` y otros para crear una interfaz organizada y agradable.
-   **Renderizado Estático:** Como esta página no tiene un archivo `page.data.tsx`, se renderiza estáticamente (o en el cliente si se navega a ella), ideal para contenido que no cambia frecuentemente.

### Demostración 2: Ruta Exclusiva de Servidor (`/server-side-info`)

Esta página es una herramienta de diagnóstico y aprendizaje diseñada para mostrar el poder del SSR.

-   **¿Qué hace?**
    -   Utiliza un `loader` en ``page.data.tsx`` para obtener información que solo está disponible en el servidor (como la versión de Node.js y la hora exacta del servidor).
    -   Muestra estos datos en la interfaz, probando que el renderizado ocurrió en el servidor.
-   **Comportamiento Condicional:**
    -   **Si SSR está activado:** Verás los datos del servidor y una explicación detallada de cómo funcionó el flujo SSR.
    -   **Si SSR está desactivado:** La página lo detectará y en su lugar mostrará una explicación del modo CSR y cómo activar el SSR en ``modern.config.ts``.
-   **¿Para qué sirve?** Úsala para verificar que tu entorno SSR está funcionando correctamente y para entender visualmente la diferencia entre ambos modos de renderizado.

### Demostración 3: Ruta Protegida y Consumo de API (`/posts`)

Esta ruta es el ejemplo más completo, simulando un caso de uso muy común: mostrar datos de una API en una página que requiere que el usuario esté autenticado.

-   **Flujo de Autenticación:**
    1.  **Estado:** La autenticación se simula mediante una cookie (`accessToken`) y un estado global de Jotai.
    2.  **Protección:** La ruta está envuelta en un High-Order Component (HOC) llamado `withAuthentication`. Este HOC comprueba la existencia de la cookie.
    3.  **Redirección:** Si la cookie no existe, el usuario es redirigido automáticamente a la página de ``/login``.
    4.  **Login:** La página ``/login`` permite simular un inicio de sesión, que crea la cookie necesaria y redirige al usuario de vuelta a la página que intentaba acceder.

-   **Flujo de Datos (Data Fetching):**
    1.  **Llamada a la API:** El `loader` en ``src/routes/posts/page.data.tsx`` utiliza nuestra instancia de Axios configurada para llamar a una API externa (JSONPlaceholder).
    2.  **Manejo de Estado:** El resultado de la API se guarda en un átomo de Jotai. La UI reacciona al estado de la petición (mostrando un spinner mientras carga, un mensaje de error si falla, o la lista de posts si tiene éxito).
    3.  **Renderizado SSR:** Como los datos se obtienen en el `loader`, la lista de posts se renderiza en el servidor, lo que significa que el usuario y los motores de búsqueda ven el contenido inmediatamente.

-   **Buenas Prácticas Demostradas:**
    -   **Lazy Loading:** El código de esta página se carga de forma perezosa para optimizar la carga inicial de la aplicación.
    -   **SEO:** La página define sus propios metadatos (`<title>`, `<description>`) para SEO a través de la función `meta`.
    -   **Arquitectura por Features:** Toda la lógica (API, componentes, estado, tipos) está organizada dentro de ``src/features/postsFeature`` y ``src/features/authFeature``.

## 6. Estrategia de Pruebas

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

    ## 7. Contribución y Licencia

### Contribución

Este estándar es un proyecto vivo y colaborativo. Las contribuciones que ayuden a mejorarlo, corregir errores o mantenerlo actualizado son siempre bienvenidas.

**Flujo de Contribución Sugerido:**

1.  **Abrir un Issue:** Antes de realizar un cambio significativo, por favor abre un "issue" en el repositorio para discutir la propuesta, el bug encontrado o la mejora sugerida.
2.  **Crear una Pull Request (PR):**
    *   Crea una nueva rama para tus cambios.
    *   Asegúrate de que tu código siga las convenciones de estilo (puedes usar `npm run format`).
    *   Asegúrate de que todas las pruebas existentes pasen (`npm test`).
    *   Si añades una nueva funcionalidad, incluye pruebas para ella.
    *   Actualiza el `CHANGELOG.md` siguiendo el formato establecido.
    *   Envía la Pull Request detallando los cambios realizados.
3.  **Revisión de Código:** La PR será revisada por el equipo de Arquitectura o los mantenedores del estándar.

## 8. SEO y Accesibilidad

**SEO (Optimización para Motores de Búsqueda):**
SEO es el proceso de mejorar la visibilidad de un sitio web en los resultados de búsqueda de los motores como Google. En este proyecto, utilizamos el componente `SEOHead` para definir metadatos importantes como el título de la página, la descripción y las palabras clave. Estos metadatos ayudan a los motores de búsqueda a entender de qué trata la página, mejorando así su indexación y visibilidad.

- **Título (`title`):** Es el texto que aparece en la pestaña del navegador y en los resultados de búsqueda. Debe ser descriptivo y contener palabras clave relevantes.
- **Descripción (`description`):** Un resumen breve de la página que aparece en los resultados de búsqueda. Debe ser atractivo para animar a los usuarios a hacer clic.
- **Palabras Clave (`keywords`):** Palabras o frases que describen el contenido de la página. Aunque su importancia ha disminuido, siguen siendo útiles para algunos motores de búsqueda.

**Accesibilidad:**
La accesibilidad web asegura que las aplicaciones sean utilizables por personas con discapacidades. Esto incluye el uso de etiquetas semánticas, atributos `alt` en imágenes, y asegurarse de que el contenido sea navegable con un teclado. La accesibilidad es crucial para cumplir con estándares legales y para proporcionar una mejor experiencia de usuario a todos.

## 9. Code Splitting

**Code Splitting (División de Código):**
Es una técnica utilizada para dividir el código de una aplicación en "chunks" o partes más pequeñas que se cargan bajo demanda. Esto mejora el tiempo de carga inicial de la aplicación, ya que solo se carga el código necesario para la vista actual.

- **Carga Perezosa (Lazy Loading):** Permite cargar componentes o rutas solo cuando son necesarios. Esto se logra utilizando la función `React.lazy()` y el componente `Suspense` de React.
- **Beneficios:** Reduce el tamaño del bundle inicial, mejora el rendimiento y proporciona una mejor experiencia de usuario.

## 10. Lighthouse

**Lighthouse:**
Lighthouse es una herramienta automatizada de código abierto para mejorar la calidad de las páginas web. Se puede ejecutar en cualquier página web, pública o que requiera autenticación. Proporciona auditorías sobre rendimiento, accesibilidad, mejores prácticas y SEO.

**Cómo usar Lighthouse:**

1. **Abrir Herramientas de Desarrollo:** Presiona F12 en tu navegador para abrir las herramientas de desarrollo.
2. **Navegar a la Pestaña Lighthouse:** Selecciona la pestaña "Lighthouse".
3. **Ejecutar una Auditoría:** Haz clic en "Generate report" para ejecutar una auditoría. Lighthouse analizará la página y proporcionará un informe detallado con sugerencias para mejorar.

### Licencia

Este proyecto y su plantilla se distribuyen bajo la **Licencia ISC**. Puedes encontrar el texto completo de la licencia en el archivo `LICENSE` del repositorio.

---

## 📚 Apéndice: Enlaces y Recursos Útiles

Para profundizar en las tecnologías utilizadas en este estándar, consulta su documentación oficial:

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

*   **Conceptos Clave:**
    *   [**Keep a Changelog** - Formato para CHANGELOG.md](https://keepachangelog.com/en/1.0.0/)
    *   [**Semantic Versioning (SemVer)** - Especificación](https://semver.org/spec/v2.0.0.html)

---

**Autor:** Arquitectura Desarrollo - Coppel
