import { useTranslation } from '@/hooks/useTranslation'
import { Dropdown } from 'primereact/dropdown'
import type React from 'react'
import { memo } from 'react'
import './LanguageSwitcher.scss'

interface LanguageOption {
  label: string
  value: string
  flag: string
}

// Bandera México (español) y bandera Estados Unidos (inglés)
const languages: LanguageOption[] = [
  { label: 'Español', value: 'es', flag: '🇲🇽' }, // México
  { label: 'English', value: 'en', flag: '🇺🇸' }, // Estados Unidos
]

const LanguageSwitcher: React.FC = memo(() => {
  const { i18n } = useTranslation()

  const handleLanguageChange = (e: { value: string }) => {
    i18n.changeLanguage(e.value)
  }

  const selectedLanguage = languages.find(lang => lang.value === i18n.language) || languages[0]

  const languageOptionTemplate = (option: LanguageOption) => (
    <div className="language-option">
      <span className="language-flag" role="img" aria-label={option.value === 'es' ? 'Bandera de México' : 'Flag of United States'}>
        {option.flag}
      </span>
      <span className="language-label">{option.label}</span>
    </div>
  )

  const selectedLanguageTemplate = (option: LanguageOption) => {
    if (option) {
      return (
        <div className="selected-language">
          <span className="language-flag" role="img" aria-label={option.value === 'es' ? 'Bandera de México' : 'Flag of United States'}>
            {option.flag}
          </span>
          <span className="language-label">{option.label}</span>
        </div>
      )
    }
    return <span>Select Language</span>
  }

  return (
    <div className="language-switcher">
      <Dropdown
        value={selectedLanguage}
        options={languages}
        onChange={handleLanguageChange}
        optionLabel="label"
        optionValue="value"
        itemTemplate={languageOptionTemplate}
        valueTemplate={selectedLanguageTemplate}
        className="language-dropdown"
        panelClassName="language-panel"
        aria-label="Select language"
        tooltip="Change language"
        tooltipOptions={{ position: 'bottom' }}
      />
    </div>
  )
})

LanguageSwitcher.displayName = 'LanguageSwitcher'

export default LanguageSwitcher
