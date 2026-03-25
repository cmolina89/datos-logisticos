import { ProgressSpinner } from 'primereact/progressspinner'
import type React from 'react'
import { Suspense } from 'react'
import './LazyLoader.scss'

interface LazyLoaderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

const DefaultFallback: React.FC = () => (
  <div className="lazy-loader-fallback">
    <ProgressSpinner
      style={{ width: '50px', height: '50px' }}
      strokeWidth="4"
      animationDuration="1s"
    />
    <p>Cargando...</p>
  </div>
)

export const LazyLoader: React.FC<LazyLoaderProps> = ({
  children,
  fallback = <DefaultFallback />,
}) => {
  return <Suspense fallback={fallback}>{children}</Suspense>
}

export default LazyLoader
