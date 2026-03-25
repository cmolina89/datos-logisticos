import { useCallback, useEffect, useRef, useState } from 'react'

interface UseLazyImageOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

interface UseLazyImageReturn {
  src: string | undefined
  isLoading: boolean
  isError: boolean
  imageRef: (node?: Element | null | undefined) => void
}

// Custom hook for intersection observer
const useIntersectionObserver = (
  options: IntersectionObserverInit & { triggerOnce?: boolean } = {}
) => {
  const [inView, setInView] = useState(false)
  const [node, setNode] = useState<Element | null>(null)

  const ref = useCallback((node?: Element | null | undefined) => {
    setNode(node || null)
  }, [])

  useEffect(() => {
    if (!node) return

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting)
      if (entry.isIntersecting && options.triggerOnce) {
        observer.disconnect()
      }
    }, options)

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [node, options])

  return { ref, inView }
}

export const useLazyImage = (
  imageSrc: string,
  placeholderSrc?: string,
  options: UseLazyImageOptions = {}
): UseLazyImageReturn => {
  const { threshold = 0.1, rootMargin = '50px', triggerOnce = true } = options

  const [src, setSrc] = useState<string | undefined>(placeholderSrc)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const imageLoadedRef = useRef(false)

  const { ref: imageRef, inView } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce,
  })

  useEffect(() => {
    if (inView && !imageLoadedRef.current) {
      setIsLoading(true)
      setIsError(false)

      const img = new Image()

      img.onload = () => {
        setSrc(imageSrc)
        setIsLoading(false)
        imageLoadedRef.current = true
      }

      img.onerror = () => {
        setIsError(true)
        setIsLoading(false)
        // Keep placeholder or set a default error image
        setSrc(placeholderSrc || '/images/error-placeholder.svg')
      }

      img.src = imageSrc
    }
  }, [inView, imageSrc, placeholderSrc])

  return {
    src,
    isLoading,
    isError,
    imageRef,
  }
}

export default useLazyImage
