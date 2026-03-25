import { useAtom } from 'jotai'
import { Button } from 'primereact/button'
// src/components/common/ThemeSwitcher/ThemeSwitcher.tsx
import { themeAtom } from '@/app/store/themeAtoms' // Usando alias
import type React from 'react'

export const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useAtom(themeAtom)

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  const icon = theme === 'light' ? 'pi pi-moon' : 'pi pi-sun'
  const label = theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'
  const currentThemeLabel = theme === 'light' ? 'Tema actual: claro' : 'Tema actual: oscuro'

  return (
    <Button
      icon={icon}
      onClick={toggleTheme}
      className="p-button-rounded p-button-text theme-switcher"
      tooltipOptions={{
        position: 'bottom',
        showDelay: 300,
        hideDelay: 100,
      }}
      aria-label={`${label}. ${currentThemeLabel}`}
      aria-pressed={theme === 'dark'}
      title={label}
      type="button"
    />
  )
}
