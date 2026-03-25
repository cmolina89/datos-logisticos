// Enhanced i18n implementation with multiple language support

import enTranslations from '../locales/en/common.json'
import esTranslations from '../locales/es/common.json'
import frTranslations from '../locales/fr/common.json'

type TranslationKey = string
type TranslationParams = Record<string, string | number>
type SupportedLanguage = 'es' | 'en' | 'fr'

interface I18nInstance {
  language: SupportedLanguage
  t: (key: TranslationKey, params?: TranslationParams) => string
  changeLanguage: (lng: SupportedLanguage) => void
  getLanguage: () => SupportedLanguage
  getSupportedLanguages: () => SupportedLanguage[]
  getLanguageInfo: (lng: SupportedLanguage) => LanguageInfo
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string
  formatCurrency: (amount: number, currency?: string) => string
}

interface LanguageInfo {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag: string
  rtl: boolean
}

const languageInfo: Record<SupportedLanguage, LanguageInfo> = {
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
  },
}

class EnhancedI18n implements I18nInstance {
  private translations = {
    es: esTranslations,
    en: enTranslations,
    fr: frTranslations,
  }

  private listeners: Array<(language: SupportedLanguage) => void> = []
  public language: SupportedLanguage

  constructor() {
    this.language = this.detectLanguage()
    this.updateDocumentLanguage()
  }

  private detectLanguage(): SupportedLanguage {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('i18nextLng') as SupportedLanguage
      if (stored && this.isValidLanguage(stored)) {
        return stored
      }

      const browserLang = navigator.language.split('-')[0] as SupportedLanguage
      if (this.isValidLanguage(browserLang)) {
        return browserLang
      }

      for (const lang of navigator.languages) {
        const langCode = lang.split('-')[0] as SupportedLanguage
        if (this.isValidLanguage(langCode)) {
          return langCode
        }
      }
    }

    return 'es'
  }

  private isValidLanguage(lng: string): lng is SupportedLanguage {
    return ['es', 'en', 'fr'].includes(lng)
  }

  private updateDocumentLanguage(): void {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = this.language
      document.documentElement.dir = languageInfo[this.language].rtl ? 'rtl' : 'ltr'
    }
  }

  public t = (key: TranslationKey, params?: TranslationParams): string => {
    const keys = key.split('.')
    let value: any = this.translations[this.language]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        value = this.translations.es
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey]
          } else {
            return key
          }
        }
        break
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        const paramValue = params[paramKey]
        return paramValue !== undefined ? paramValue.toString() : match
      })
    }

    return value
  }

  public changeLanguage = (lng: SupportedLanguage): void => {
    if (this.isValidLanguage(lng)) {
      this.language = lng

      if (typeof window !== 'undefined') {
        localStorage.setItem('i18nextLng', lng)
      }

      this.updateDocumentLanguage()
      this.listeners.forEach(listener => listener(lng))
    }
  }

  public getLanguage = (): SupportedLanguage => {
    return this.language
  }

  public getSupportedLanguages = (): SupportedLanguage[] => {
    return ['es', 'en', 'fr']
  }

  public getLanguageInfo = (lng: SupportedLanguage): LanguageInfo => {
    return languageInfo[lng]
  }

  public formatNumber = (num: number, options?: Intl.NumberFormatOptions): string => {
    try {
      return new Intl.NumberFormat(this.language, options).format(num)
    } catch {
      return num.toString()
    }
  }

  public formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    try {
      return new Intl.DateTimeFormat(this.language, options).format(date)
    } catch {
      return date.toLocaleDateString()
    }
  }

  public formatCurrency = (amount: number, currency: string = 'USD'): string => {
    try {
      return new Intl.NumberFormat(this.language, {
        style: 'currency',
        currency,
      }).format(amount)
    } catch {
      return `${currency} ${amount}`
    }
  }

  public subscribe = (listener: (language: SupportedLanguage) => void): (() => void) => {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }
}

const i18n = new EnhancedI18n()

export default i18n
export type { LanguageInfo, SupportedLanguage }
