import i18n from '@/lib/i18n'
import { useEffect, useState } from 'react'

type TranslationParams = Record<string, string | number>

export const useTranslation = () => {
  const [language, setLanguage] = useState(i18n.getLanguage())

  useEffect(() => {
    const unsubscribe = i18n.subscribe((lng) => {
      setLanguage(lng)
    })
    setLanguage(i18n.getLanguage())
    return unsubscribe
  }, [])

  const t = (key: string, params?: TranslationParams): string => {
    return i18n.t(key, params)
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng as any)
    setLanguage(i18n.getLanguage())
  }

  return {
    t,
    i18n: {
      language,
      changeLanguage,
    },
  }
}

export default useTranslation
