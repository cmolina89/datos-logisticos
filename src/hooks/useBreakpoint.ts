import { useEffect, useState } from 'react'

// Breakpoints que coinciden con los de SCSS
const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
} as const

type Breakpoint = keyof typeof breakpoints

interface BreakpointState {
  current: Breakpoint
  isXs: boolean
  isSm: boolean
  isMd: boolean
  isLg: boolean
  isXl: boolean
  isXxl: boolean
  isSmUp: boolean
  isMdUp: boolean
  isLgUp: boolean
  isXlUp: boolean
  isXxlUp: boolean
  isSmDown: boolean
  isMdDown: boolean
  isLgDown: boolean
  isXlDown: boolean
  width: number
  height: number
}

const getCurrentBreakpoint = (width: number): Breakpoint => {
  if (width >= breakpoints.xxl) return 'xxl'
  if (width >= breakpoints.xl) return 'xl'
  if (width >= breakpoints.lg) return 'lg'
  if (width >= breakpoints.md) return 'md'
  if (width >= breakpoints.sm) return 'sm'
  return 'xs'
}

const createBreakpointState = (width: number, height: number): BreakpointState => {
  const current = getCurrentBreakpoint(width)

  return {
    current,
    isXs: current === 'xs',
    isSm: current === 'sm',
    isMd: current === 'md',
    isLg: current === 'lg',
    isXl: current === 'xl',
    isXxl: current === 'xxl',
    isSmUp: width >= breakpoints.sm,
    isMdUp: width >= breakpoints.md,
    isLgUp: width >= breakpoints.lg,
    isXlUp: width >= breakpoints.xl,
    isXxlUp: width >= breakpoints.xxl,
    isSmDown: width < breakpoints.sm,
    isMdDown: width < breakpoints.md,
    isLgDown: width < breakpoints.lg,
    isXlDown: width < breakpoints.xl,
    width,
    height,
  }
}

export const useBreakpoint = (): BreakpointState => {
  const [state, setState] = useState<BreakpointState>(() => {
    if (typeof window === 'undefined') {
      // SSR fallback - asume móvil
      return createBreakpointState(375, 667)
    }
    return createBreakpointState(window.innerWidth, window.innerHeight)
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    let timeoutId: NodeJS.Timeout

    const handleResize = () => {
      // Debounce para mejorar rendimiento
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setState(createBreakpointState(window.innerWidth, window.innerHeight))
      }, 100)
    }

    // Configurar listener con passive para mejor rendimiento
    window.addEventListener('resize', handleResize, { passive: true })

    // Configurar listener para cambios de orientación
    const handleOrientationChange = () => {
      // Pequeño delay para que el navegador actualice las dimensiones
      setTimeout(() => {
        setState(createBreakpointState(window.innerWidth, window.innerHeight))
      }, 100)
    }

    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return state
}

// Hook para verificar si coincide con un breakpoint específico
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Configurar listener
    mediaQuery.addEventListener('change', handleChange)

    // Verificar estado inicial
    setMatches(mediaQuery.matches)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}

// Hook para detectar dispositivos táctiles
export const useTouchDevice = (): boolean => {
  return useMediaQuery('(hover: none) and (pointer: coarse)')
}

// Hook para detectar preferencias del usuario
export const useUserPreferences = () => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const prefersHighContrast = useMediaQuery('(prefers-contrast: high)')

  return {
    prefersReducedMotion,
    prefersDarkMode,
    prefersHighContrast,
  }
}

// Hook para detectar orientación
export const useOrientation = () => {
  const isLandscape = useMediaQuery('(orientation: landscape)')
  const isPortrait = useMediaQuery('(orientation: portrait)')

  return {
    isLandscape,
    isPortrait,
  }
}

// Hook para detectar densidad de píxeles
export const usePixelDensity = () => {
  const isRetina = useMediaQuery('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)')
  const isHighDensity = useMediaQuery(
    '(-webkit-min-device-pixel-ratio: 3), (min-resolution: 288dpi)'
  )

  return {
    isRetina,
    isHighDensity,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
  }
}

// Utilidades para componentes responsive
export const breakpointUtils = {
  // Obtener valor basado en breakpoint actual
  getResponsiveValue: <T>(
    values: Partial<Record<Breakpoint, T>>,
    currentBreakpoint: Breakpoint,
    fallback: T
  ): T => {
    // Orden de prioridad descendente
    const order: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs']
    const currentIndex = order.indexOf(currentBreakpoint)

    // Buscar valor desde el breakpoint actual hacia abajo
    for (let i = currentIndex; i < order.length; i++) {
      const bp = order[i]
      if (values[bp] !== undefined) {
        return values[bp] as T
      }
    }

    return fallback
  },

  // Verificar si el breakpoint actual es mayor o igual al especificado
  isBreakpointUp: (current: Breakpoint, target: Breakpoint): boolean => {
    return breakpoints[current] >= breakpoints[target]
  },

  // Verificar si el breakpoint actual es menor al especificado
  isBreakpointDown: (current: Breakpoint, target: Breakpoint): boolean => {
    return breakpoints[current] < breakpoints[target]
  },
}

export { breakpoints }
export type { Breakpoint, BreakpointState }
