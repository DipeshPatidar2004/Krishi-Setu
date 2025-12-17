import { useState, useEffect } from 'react'
import { LanguageContext } from './LanguageContext'
import enMessages from '../locales/en.json'
import hiMessages from '../locales/hi.json'
import mrMessages from '../locales/mr.json'

const messages = {
  en: enMessages,
  hi: hiMessages,
  mr: mrMessages
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to 'en'
    return localStorage.getItem('krishiSetuLanguage') || 'en'
  })

  useEffect(() => {
    localStorage.setItem('krishiSetuLanguage', language)
    document.documentElement.lang = language
  }, [language])

  const t = (key, variables = {}) => {
    const keys = key.split('.')
    let value = messages[language]

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    // Replace variables like {{name}} with actual values
    let result = value
    Object.keys(variables).forEach(varKey => {
      result = result.replace(`{{${varKey}}}`, variables[varKey])
    })

    return result
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
