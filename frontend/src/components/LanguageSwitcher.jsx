import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en', label: 'English', display: 'EN', flag: '🇬🇧' },
    { code: 'hi', label: 'हिंदी', display: 'हिं', flag: '🇮🇳' },
    { code: 'mr', label: 'मराठी', display: 'मरा', flag: '🇮🇳' }
  ]

  const currentLang = languages.find(l => l.code === language)

  return (
    <div className="relative">
      {/* Main Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition font-medium shadow-md"
      >
        <span className="text-lg">{currentLang?.flag}</span>
        <span>{currentLang?.display}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code)
                setIsOpen(false)
              }}
              className={`w-full px-4 py-3 flex items-center space-x-3 transition ${
                language === lang.code
                  ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="text-left flex-1">
                <p className="font-medium">{lang.label}</p>
                <p className="text-xs text-gray-500">{lang.display}</p>
              </div>
              {language === lang.code && (
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
