import { useBreakpoint } from '@/hooks/useBreakpoint'
import React from 'react'
import './ResponsiveLayout.scss'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  className?: string
  container?: boolean
  fluid?: boolean
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | false
  padding?: boolean
  centerContent?: boolean
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className = '',
  container = true,
  fluid = false,
  maxWidth = 'xl',
  padding = true,
  centerContent = false,
}) => {
  const breakpoint = useBreakpoint()

  const getLayoutClasses = () => {
    const classes = ['responsive-layout']

    if (container && !fluid) {
      classes.push('responsive-layout--container')
      if (maxWidth) {
        classes.push(`responsive-layout--max-${maxWidth}`)
      }
    }

    if (fluid) {
      classes.push('responsive-layout--fluid')
    }

    if (padding) {
      classes.push('responsive-layout--padded')
    }

    if (centerContent) {
      classes.push('responsive-layout--centered')
    }

    // Agregar clases de breakpoint actual
    classes.push(`responsive-layout--${breakpoint.current}`)

    if (className) {
      classes.push(className)
    }

    return classes.join(' ')
  }

  return <div className={getLayoutClasses()}>{children}</div>
}

// Componente Grid responsive
interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  columns?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    xxl?: number
  }
  gap?: {
    xs?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
    xxl?: string
  }
  alignItems?: 'start' | 'center' | 'end' | 'stretch'
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
  alignItems = 'stretch',
  justifyContent = 'start',
}) => {
  const breakpoint = useBreakpoint()

  const getGridStyles = (): React.CSSProperties => {
    const currentColumns =
      columns[breakpoint.current] || columns.lg || columns.md || columns.sm || columns.xs || 1

    const currentGap = gap[breakpoint.current] || gap.lg || gap.md || gap.sm || gap.xs || '1rem'

    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${currentColumns}, 1fr)`,
      gap: currentGap,
      alignItems,
      justifyContent,
    }
  }

  return (
    <div className={`responsive-grid ${className}`} style={getGridStyles()}>
      {children}
    </div>
  )
}

// Componente para mostrar/ocultar contenido basado en breakpoints
interface ResponsiveVisibilityProps {
  children: React.ReactNode
  showOn?: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'>
  hideOn?: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'>
  showOnUp?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  hideOnUp?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  showOnDown?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  hideOnDown?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
}

type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

const BREAKPOINT_ORDER: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']

const getBreakpointIndex = (value: BreakpointKey): number => BREAKPOINT_ORDER.indexOf(value)

const isBelow = (current: BreakpointKey, target: BreakpointKey): boolean =>
  getBreakpointIndex(current) < getBreakpointIndex(target)

const isAtOrAbove = (current: BreakpointKey, target: BreakpointKey): boolean =>
  getBreakpointIndex(current) >= getBreakpointIndex(target)

const isAbove = (current: BreakpointKey, target: BreakpointKey): boolean =>
  getBreakpointIndex(current) > getBreakpointIndex(target)

const isAtOrBelow = (current: BreakpointKey, target: BreakpointKey): boolean =>
  getBreakpointIndex(current) <= getBreakpointIndex(target)

export const ResponsiveVisibility: React.FC<ResponsiveVisibilityProps> = ({
  children,
  showOn,
  hideOn,
  showOnUp,
  hideOnUp,
  showOnDown,
  hideOnDown,
}) => {
  const breakpoint = useBreakpoint()

  const shouldShow = (): boolean => {
    const currentBreakpoint = breakpoint.current as BreakpointKey

    return (
      !(showOn && !showOn.includes(currentBreakpoint)) &&
      !(hideOn && hideOn.includes(currentBreakpoint)) &&
      !(showOnUp && isBelow(currentBreakpoint, showOnUp)) &&
      !(hideOnUp && isAtOrAbove(currentBreakpoint, hideOnUp)) &&
      !(showOnDown && isAbove(currentBreakpoint, showOnDown)) &&
      !(hideOnDown && isAtOrBelow(currentBreakpoint, hideOnDown))
    )
  }

  if (!shouldShow()) {
    return null
  }

  return <>{children}</>
}

// Componente para contenido responsive con diferentes versiones
interface ResponsiveContentProps {
  mobile?: React.ReactNode
  tablet?: React.ReactNode
  desktop?: React.ReactNode
  fallback?: React.ReactNode
}

export const ResponsiveContent: React.FC<ResponsiveContentProps> = ({
  mobile,
  tablet,
  desktop,
  fallback,
}) => {
  const breakpoint = useBreakpoint()

  const getContent = (): React.ReactNode => {
    if (breakpoint.isLgUp && desktop) {
      return desktop
    }

    if (breakpoint.isMdUp && tablet) {
      return tablet
    }

    if (mobile) {
      return mobile
    }

    return fallback || null
  }

  return <>{getContent()}</>
}

export default ResponsiveLayout
