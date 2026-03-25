# Documentación General del Proyecto CoppelFramework - WebClient React

¡Hola! Bienvenido a la documentación técnica del proyecto. Este documento está diseñado para guiarte a través de los aspectos fundamentales de nuestra plantilla, desde la configuración inicial hasta las estrategias de seguridad y arquitectura. Aquí encontrarás todo lo que necesitas para entender cómo funciona el engranaje de esta aplicación.

---

## 1. Explicación General de la Plantilla

Esta plantilla es el punto de partida oficial para el desarrollo de aplicaciones web en Coppel utilizando **React** y **Modern.js**. Su objetivo es estandarizar la forma en que construimos software, asegurando calidad, rendimiento y mantenibilidad desde el primer día.

La arquitectura está diseñada para soportar **Renderizado Híbrido (SSR + CSR)**, lo que nos permite ofrecer una carga inicial ultra rápida (bueno para SEO y UX) y una navegación fluida tipo SPA una vez que la aplicación ha cargado. Además, está preparada para escalar hacia microfrontends gracias al soporte nativo de Module Federation de Modern.js.

**Puntos clave:**
*   **Framework Base:** Modern.js (sobre React).
*   **Enfoque:** Híbrido (Server-Side Rendering + Client-Side Rendering).
*   **Estilo:** SCSS con módulos y PrimeFlex/PrimeReact para componentes UI.
*   **Estado:** Jotai para gestión de estado global simple y atómica.

---

## 2. Versionamiento de Tecnologías

Para mantener la compatibilidad y estabilidad, nos adherimos a las siguientes versiones base. Asegúrate de que tu entorno local cumpla con estos requisitos:

| Tecnología | Versión | Notas |
| :--- | :--- | :--- |
| **Node.js** | `>=20.x` | Requerido para ejecutar el entorno de Modern.js. |
| **React** | `^18.3.1` | Biblioteca base de UI. |
| **Modern.js** | `2.69.4` | Framework full-stack que orquesta todo. |
| **TypeScript** | `~5.9.3` | Lenguaje principal para todo el desarrollo. |
| **Playwright** | `^1.57.0` | Framework para pruebas End-to-End. |

---

## 3. Scaffolding y Nombrado de Archivos

Nuestra estructura de carpetas no es aleatoria; sigue una **Arquitectura por Features**. Esto significa que agrupamos el código por "funcionalidad de negocio" en lugar de por "tipo de archivo".

### Estructura Principal (`src/`)

*   **`app/`**: Configuración global de la aplicación (Providers, Store global compartido).
*   **`components/`**: Componentes UI genéricos y reutilizables (botones, inputs, layouts) que no dependen de una lógica de negocio específica.
*   **`features/`**: **El corazón del proyecto.** Aquí viven los módulos de negocio (ej. `authFeature`, `postsFeature`). Cada feature es autocontenida.
*   **`routes/`**: Definición de rutas basada en el sistema de archivos de Modern.js.
    *   `page.tsx`: El componente visual de la ruta.
    *   `page.data.tsx`: El `loader` para SSR (carga de datos en servidor).
    *   `layout.tsx`: Layouts anidados.
*   **`lib/`**: Configuraciones de librerías externas (ej. instancia de Axios).
*   **`utils/`**: Funciones auxiliares puras.

### Convenciones de Nombrado

*   **Carpetas y Componentes:** `PascalCase` (ej. `UserProfile`, `PostCard.tsx`).
*   **Archivos de Lógica/Hooks:** `camelCase` (ej. `useAuth.ts`, `postsService.ts`).
*   **Estilos:** `kebab-case` para archivos SCSS (ej. `post-card.scss`).
*   **Pruebas:** Mismo nombre que el archivo probado + `.test.tsx` (Unitarias) o `.spec.ts` (E2E).

---

## 4. Configuración del Repositorio

El proyecto viene con scripts listos para usar en `package.json` que facilitan tu día a día:

*   **`npm run dev`**: Levanta el servidor de desarrollo con Hot Reload.
*   **`npm run build`**: Compila la aplicación para producción.
*   **`npm run start`**: Ejecuta la versión compilada (producción).
*   **`npm run lint` / `npm run format`**: Revisa y arregla el estilo de código usando Biome.
*   **`npm test`**: Corre pruebas unitarias con Jest.
*   **`npm run e2e`**: Corre pruebas E2E con Playwright.

**Hooks de Git:**
Usamos `simple-git-hooks` para ejecutar tareas automáticas. Por ejemplo, antes de cada commit (`pre-commit`), se ejecuta `lint-staged` para asegurar que solo subas código limpio y bien formateado.

---

## 5. Explicación de Archivos `.gitignore` y Environments

### `.gitignore`
Este archivo es vital para mantener el repositorio limpio y seguro. Ignoramos:
*   `node_modules/`: Dependencias instaladas.
*   `dist/`, `output/`: Archivos generados por el build.
*   `.env*`: **¡Muy importante!** Nunca subas tus variables de entorno al repositorio.
*   Archivos de sistema o IDE (`.DS_Store`, `.vscode/`, `.idea/`).

### Variables de Entorno (`.env`)
Manejamos las variables de entorno con una distinción clara entre Cliente y Servidor, gestionada en `src/config/environment.ts`:

1.  **Variables de Servidor:** Disponibles solo en Node.js (ej. durante SSR o build). Se acceden vía `process.env`.
2.  **Variables de Cliente:** Para que una variable sea visible en el navegador, **DEBE** comenzar con el prefijo `MODERN_APP_`.

**Ejemplo:**
*   `API_SECRET_KEY=123` -> Solo visible en servidor.
*   `MODERN_APP_API_URL=https://api.com` -> Visible en servidor y navegador.

---

## 6. Gestión Segura de Storage

La seguridad es prioridad. No usamos `localStorage` o `sessionStorage` directamente para guardar información sensible (como tokens de acceso) debido a vulnerabilidades XSS.

Hemos implementado una utilidad `SecureStorage` (`src/utils/secureStorage.ts`) que:

1.  **Encriptación:** Aplica una encriptación simple (XOR + Base64) a los datos antes de guardarlos.
2.  **Memoria vs. Disco:**
    *   **Tokens Sensibles:** Se guardan **SOLO en memoria** (variables JS). Esto significa que si el usuario refresca la página, podría necesitar re-autenticarse o usar un mecanismo de refresh token, pero es mucho más seguro contra ataques de robo de sesión.
    *   **Datos No Críticos:** Pueden persistirse con opciones de expiración.
3.  **Expiración:** Soporta `maxAge` para invalidar datos automáticamente después de un tiempo.

**Uso recomendado:**
```typescript
import { authStorage } from '@/utils/secureStorage';

// Guardar token (se encripta y guarda en memoria)
authStorage.setAuthToken('mi-token-super-secreto');

// Leer token
const token = authStorage.getAuthToken();
```

---

## 7. Reglas de Routing y Protección de Roles

El enrutamiento se basa en el sistema de archivos de Modern.js (`src/routes`), pero la protección de rutas es programática.

### ¿Cómo protegemos una ruta?
Utilizamos un componente "Layout" especial: `ProtectedRouteLayout` (`src/features/authFeature/routes/ProtectedRouteLayout.tsx`).

1.  **Verificación:** Este layout lee el estado global de autenticación (usando Jotai `isAuthenticatedAtom`).
2.  **Redirección:** Si el usuario no está autenticado, lo redirige automáticamente a `/login`, guardando la ruta original para devolverlo allí después.
3.  **Renderizado:** Si está autenticado, renderiza el contenido de la ruta (`<Outlet />`).

**Para proteger una sección nueva:**
Simplemente anida tus rutas bajo una carpeta que use este layout, o envuelve tus componentes de página con lógica de verificación similar si necesitas granularidad.

---

## 8. Estrategia para Servicios (Token, Timeout, etc.)

Centralizamos todas las peticiones HTTP a través de una instancia configurada de **Axios** en `src/lib/httpClient.ts`. Esto nos da consistencia y control.

**Características de la instancia:**
*   **Base URL:** Se toma de la configuración de entorno (`config.apiBaseUrl`), permitiendo cambiar fácilmente entre desarrollo y producción.
*   **Timeout:** Configurado a **10,000 ms (10 segundos)**. Si una petición tarda más, se cancela automáticamente para no dejar colgada la UI.
*   **Headers:** Se aplican headers de seguridad y `Content-Type: application/json` por defecto.

**Interceptores:**
*   **Request:** Preparado para inyectar el Token de Autorización automáticamente en cada petición (ej. `Authorization: Bearer ...`).
*   **Response:** Manejo centralizado de errores.
    *   `401 Unauthorized`: Lugar ideal para disparar lógica de logout o refresh token.
    *   `403 Forbidden`: Permisos insuficientes.
    *   `500 Internal Server Error`: Problemas del lado del servidor.

**Recomendación:**
Nunca uses `fetch` o `axios` directamente en tus componentes. Crea un "Service" dentro de tu feature (ej. `postsService.ts`) que use esta instancia `httpClient`.