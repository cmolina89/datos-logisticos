// src/components/Icon/index.tsx
import type React from 'react'
import './Icon.scss'

interface IconProps {
  icon: string
  className?: string
  onClick?: (
    event: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>
  ) => void
  children?: React.ReactNode
  ariaLabel?: string
  /** Si es decorativo, se ocultará de screen readers */
  decorative?: boolean
  /** Tamaño del icono para mejor accesibilidad */
  size?: 'small' | 'medium' | 'large'
}

const Icon: React.FC<IconProps> = ({
  icon = '',
  className = '',
  onClick,
  children,
  ariaLabel = '',
  decorative = false,
  size = 'medium',
}) => {
  const isClickable = !!onClick

  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick(event)
    }
  }

  const iconClassName = icon ? `clt-${icon}` : ''

  // Clases de tamaño para mejor accesibilidad
  const sizeClasses = {
    small: 'icon-small',
    medium: 'icon-medium',
    large: 'icon-large',
  }

  // Si es decorativo, no necesita aria-label y debe estar oculto para screen readers
  const accessibilityProps = decorative
    ? { 'aria-hidden': 'true' as const }
    : {
        'aria-label': ariaLabel || (typeof children === 'string' ? undefined : icon),
      }

  const commonClassName = `${iconClassName} ${sizeClasses[size]} ${className}`.trim()

  // Si es clickeable, usar button; si no, usar span
  if (isClickable) {
    return (
      <button
        type="button"
        data-testid="icon-element"
        className={`${commonClassName} icon-interactive cursor-pointer`}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          font: 'inherit',
          cursor: 'pointer',
        }}
        {...(!decorative && { 'aria-label': ariaLabel || icon })}
      >
        {children}
      </button>
    )
  }

  return (
    <span data-testid="icon-element" className={commonClassName} {...accessibilityProps}>
      {children}
    </span>
  )
}

export default Icon
