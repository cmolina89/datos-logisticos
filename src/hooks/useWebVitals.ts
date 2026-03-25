import { config } from '@/config/environment'
import { applySecurityHeaders } from '@/utils/securityHeaders'
import { useEffect } from 'react'

interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

interface WebVitalsOptions {
  reportAllChanges?: boolean
  onMetric?: (metric: WebVitalsMetric) => void
}

// Thresholds for Core Web Vitals
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
}

const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

const sendToAnalytics = (metric: WebVitalsMetric) => {
  // Send to your analytics service
  console.log('Web Vital:', metric)

  // Example: Google Analytics 4
  if (typeof window !== 'undefined' && 'gtag' in window) {
    ;(window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      custom_map: {
        metric_rating: metric.rating,
        metric_delta: metric.delta,
      },
    })
  }

  // Example: Custom analytics endpoint
  if (config.isProduction) {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: applySecurityHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }),
    }).catch(console.error)
  }
}

export const useWebVitals = (options: WebVitalsOptions = {}) => {
  const { reportAllChanges = false, onMetric } = options

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleMetric = (metric: WebVitalsMetric) => {
      const enhancedMetric = {
        ...metric,
        rating: getRating(metric.name, metric.value),
      }

      // Call custom callback
      onMetric?.(enhancedMetric)

      // Send to analytics
      sendToAnalytics(enhancedMetric)
    }

    // Dynamic import to avoid loading web-vitals in SSR
    import('web-vitals')
      .then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        // Core Web Vitals
        onCLS(handleMetric, { reportAllChanges })
        onINP(handleMetric, { reportAllChanges })
        onLCP(handleMetric, { reportAllChanges })

        // Other important metrics
        onFCP(handleMetric, { reportAllChanges })
        onTTFB(handleMetric, { reportAllChanges })
      })
      .catch(console.error)

    // Custom performance metrics
    const measureCustomMetrics = () => {
      if ('performance' in window && 'measure' in performance) {
        try {
          // Time to Interactive (TTI) approximation
          const navigationEntry = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming
          if (navigationEntry) {
            const tti = navigationEntry.domInteractive - navigationEntry.fetchStart
            handleMetric({
              name: 'TTI',
              value: tti,
              rating: getRating('TTI', tti),
              delta: tti,
              id: `tti-${Date.now()}`,
            })
          }

          // Bundle size metrics
          const resourceEntries = performance.getEntriesByType(
            'resource'
          ) as PerformanceResourceTiming[]
          const jsSize = resourceEntries
            .filter(entry => entry.name.includes('.js'))
            .reduce((total, entry) => total + (entry.transferSize || 0), 0)

          if (jsSize > 0) {
            handleMetric({
              name: 'JS_SIZE',
              value: jsSize,
              rating: jsSize < 250000 ? 'good' : jsSize < 500000 ? 'needs-improvement' : 'poor',
              delta: jsSize,
              id: `js-size-${Date.now()}`,
            })
          }
        } catch (error) {
          console.warn('Error measuring custom metrics:', error)
        }
      }
    }

    // Measure custom metrics after page load
    if (document.readyState === 'complete') {
      measureCustomMetrics()
    } else {
      window.addEventListener('load', measureCustomMetrics)
    }

    return () => {
      window.removeEventListener('load', measureCustomMetrics)
    }
  }, [reportAllChanges, onMetric])
}

// Hook for monitoring specific user interactions
export const usePerformanceMonitoring = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          console.log('Custom measure:', entry.name, entry.duration)
        }
      }
    })

    observer.observe({ entryTypes: ['measure'] })

    return () => {
      observer.disconnect()
    }
  }, [])

  const measureUserAction = (actionName: string, fn: () => void | Promise<void>) => {
    const startMark = `${actionName}-start`
    const endMark = `${actionName}-end`
    const measureName = `${actionName}-duration`

    performance.mark(startMark)

    const result = fn()

    if (result instanceof Promise) {
      return result.finally(() => {
        performance.mark(endMark)
        performance.measure(measureName, startMark, endMark)
      })
    } else {
      performance.mark(endMark)
      performance.measure(measureName, startMark, endMark)
      return result
    }
  }

  return { measureUserAction }
}

export default useWebVitals
