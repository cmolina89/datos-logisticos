// src/types/globals.ts

// Define la estructura del objeto de metadatos que nuestras páginas devolverán
export interface MetaData {
  title?: string
  description?: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key: string]: any // Permite otras metaetiquetas que Modern.js pueda soportar
}

export interface CookieValues {
  name?: string
}
// Opcional: También puedes definir el tipo de la función si lo usas en muchos lugares
// export type MetaFunction = () => MetaData;
