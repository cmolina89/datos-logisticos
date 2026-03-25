import { useLazyImage } from '@/hooks/useLazyImage'
import type React from 'react'
import { memo } from 'react'
import './LazyImage.scss'

interface LazyImageProps {
  src: string
  alt: string
  placeholder?: string
  className?: string
  width?: number | string
  height?: number | string
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
  threshold?: number
  rootMargin?: string
}

const LazyImage: React.FC<LazyImageProps> = memo(
  ({
    src,
    alt,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhcmdhbmRvLi4uPC90ZXh0Pjwvc3ZnPg==',
    className = '',
    width,
    height,
    loading = 'lazy',
    onLoad,
    onError,
    threshold = 0.1,
    rootMargin = '50px',
  }) => {
    const {
      src: imageSrc,
      isLoading,
      isError,
      imageRef,
    } = useLazyImage(src, placeholder, {
      threshold,
      rootMargin,
      triggerOnce: true,
    })

    const handleLoad = () => {
      onLoad?.()
    }

    const handleError = () => {
      onError?.()
    }

    return (
      <div
        ref={imageRef}
        className={`lazy-image-container ${className} ${isLoading ? 'loading' : ''} ${isError ? 'error' : ''}`}
        style={{ width, height }}
      >
        <img
          src={imageSrc}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`lazy-image ${isLoading ? 'lazy-image--loading' : ''}`}
          style={{ width: '100%', height: '100%' }}
        />
        {isLoading && (
          <div className="lazy-image-placeholder">
            <div className="lazy-image-spinner" />
          </div>
        )}
        {isError && (
          <div className="lazy-image-error">
            <span>Error al cargar imagen</span>
          </div>
        )}
      </div>
    )
  }
)

LazyImage.displayName = 'LazyImage'

export default LazyImage
