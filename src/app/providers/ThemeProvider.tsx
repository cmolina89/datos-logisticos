import { useAtomValue } from 'jotai' // Usamos useAtomValue porque solo leemos el tema aquí
import { PrimeReactContext } from 'primereact/api'
// src/app/providers/ThemeProvider.tsx
import type React from 'react' // Añadido useContext
import { useContext, useEffect, useState } from 'react'
import { themeAtom } from '@/app/store/themeAtoms' // Usando alias

interface ThemeProviderProps {
  children: React.ReactNode
}

// URLs de los temas de PrimeReact (relativas a la carpeta `public`)
const LARA_LIGHT_INDIGO_URL = '/themes/lara-light-indigo/theme.css'
const LARA_DARK_INDIGO_URL = '/themes/lara-dark-indigo/theme.css'

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const currentTheme = useAtomValue(themeAtom) // Solo necesitamos leer el valor del átomo
  const primeReactContext = useContext(PrimeReactContext) // Para la función changeTheme
  const [themeLinkElement, setThemeLinkElement] = useState<HTMLLinkElement | null>(null)

  // Efecto para crear o encontrar el <link> para el tema de PrimeReact una sola vez
  useEffect(() => {
    let linkEl = document.getElementById('primereact-theme-link') as HTMLLinkElement
    if (!linkEl) {
      linkEl = document.createElement('link')
      linkEl.id = 'primereact-theme-link'
      linkEl.rel = 'stylesheet'
      document.head.appendChild(linkEl)
    }
    setThemeLinkElement(linkEl)
  }, [])

  // Efecto para cambiar el tema de PrimeReact y la clase del body
  useEffect(() => {
    if (themeLinkElement && primeReactContext.changeTheme) {
      const newThemeName = currentTheme === 'light' ? 'lara-light-indigo' : 'lara-dark-indigo'
      const oldThemeName = currentTheme === 'light' ? 'lara-dark-indigo' : 'lara-light-indigo' // El opuesto
      const newThemeUrl = currentTheme === 'light' ? LARA_LIGHT_INDIGO_URL : LARA_DARK_INDIGO_URL

      // Cambia el href del <link> del tema. Esto es lo que realmente cambia los estilos.
      themeLinkElement.href = newThemeUrl

      // Opcional: Llama a PrimeReactContext.changeTheme para la consistencia interna de PrimeReact.
      // Esto es útil si algunos componentes de PrimeReact ajustan su comportamiento o
      // estilos internos basados en el nombre del tema activo, más allá del CSS.
      primeReactContext.changeTheme(oldThemeName, newThemeName, 'primereact-theme-link', () => {
        // console.log(`PrimeReact theme changed to ${newThemeName} via context`);
      })

      // Aplicar clase al body para tus estilos personalizados en global.scss
      document.body.classList.remove('dark-theme', 'light-theme')
      document.body.classList.add(currentTheme === 'dark' ? 'dark-theme' : 'light-theme')
    }
  }, [currentTheme, themeLinkElement, primeReactContext])

  return <>{children}</>
}
