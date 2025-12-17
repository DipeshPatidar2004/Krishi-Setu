Y# Multi-Language Support Implementation Guide

## Overview

Your Krishi Setu website now supports multiple languages! The application includes:
- **English (EN)** - English
- **Hindi (हिं)** - हिंदी
- **Marathi (मरा)** - मराठी

## Architecture

### Files Added

1. **Language Files** (`src/locales/`)
   - `en.json` - English translations
   - `hi.json` - Hindi translations
   - `mr.json` - Marathi translations

2. **Context & Provider** (`src/context/`)
   - `LanguageContext.jsx` - Context for language state
   - `LanguageProvider.jsx` - Provider component with translation logic

3. **Hook** (`src/hooks/`)
   - `useLanguage.js` - Hook to access language functionality

4. **Components**
   - `LanguageSwitcher.jsx` - Language selector buttons in navbar

## How It Works

### 1. Translation Function (`t()`)

The `useLanguage()` hook provides a `t()` function for translations:

```jsx
import { useLanguage } from '../hooks/useLanguage'

const MyComponent = () => {
  const { t } = useLanguage()
  
  return <h1>{t('hero.title')}</h1>
}
```

### 2. Nested Translation Keys

Translations are organized hierarchically in JSON:

```json
{
  "nav": {
    "home": "Home",
    "marketplace": "Marketplace"
  }
}
```

Access with dot notation: `t('nav.home')`

### 3. Variables in Translations

Translations support dynamic variables using `{{variable}}` syntax:

```json
{
  "hero": {
    "welcome": "Welcome back, {{name}}!"
  }
}
```

Usage:
```jsx
t('hero.welcome', { name: 'John' })
```

### 4. Language Persistence

Selected language is automatically saved to `localStorage` as `krishiSetuLanguage` and restored on page reload.

## Updated Components

The following components now support multiple languages:

1. **Navbar.jsx** - Navigation items and login button
2. **Hero.jsx** - Welcome heading and statistics
3. **Features.jsx** - Feature titles and descriptions
4. **Footer.jsx** - Footer links and information

## Using Multi-Language in Your Components

### Basic Example

```jsx
import { useLanguage } from '../hooks/useLanguage'

const MyComponent = () => {
  const { t, language, setLanguage } = useLanguage()

  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>Current language: {language}</p>
      <button onClick={() => setLanguage('hi')}>
        Switch to Hindi
      </button>
    </div>
  )
}
```

### Adding Translations to More Components

1. Open the component file (e.g., `Marketplace.jsx`)
2. Import the hook:
```jsx
import { useLanguage } from '../hooks/useLanguage'
```

3. Use it in the component:
```jsx
const Marketplace = () => {
  const { t } = useLanguage()
  // ... rest of component
  return <h2>{t('marketplace.title')}</h2>
}
```

4. Add corresponding translations to JSON files:
```json
// src/locales/en.json
{
  "marketplace": {
    "title": "Digital Marketplace"
  }
}
```

## Adding New Languages

To add support for a new language (e.g., Gujarati):

1. Create a new translation file `src/locales/gu.json` with all translation keys

2. Update `LanguageProvider.jsx`:
```jsx
import guMessages from '../locales/gu.json'

const messages = {
  en: enMessages,
  hi: hiMessages,
  mr: mrMessages,
  gu: guMessages  // Add this
}
```

3. Update `LanguageSwitcher.jsx` to add the new language button:
```jsx
<button onClick={() => setLanguage('gu')}>
  ગુ  {/* Gujarati script */}
</button>
```

## Translation Structure

All available translation keys are organized by feature:

- `nav.*` - Navigation items
- `hero.*` - Hero section
- `hero_stats.*` - Statistics
- `features.*` - Features section
- `marketplace.*` - Marketplace page
- `equipment.*` - Equipment rental page
- `government.*` - Government portal page
- `footer.*` - Footer section
- `auth.*` - Authentication (login/register)

## Best Practices

1. **Keep Translation Keys Consistent** - Use lowercase with dots for nesting
2. **Translate Entire Sentences** - Don't translate individual words to maintain context
3. **Test All Languages** - Ensure text doesn't overflow in different languages
4. **Use Variables for Dynamic Content** - Instead of concatenating strings
5. **Organize Logically** - Group related translations together

## Technical Details

### Language Context Structure

```jsx
{
  language: 'en',           // Current language code
  setLanguage: (lang) => {}, // Function to change language
  t: (key, vars) => string   // Translation function
}
```

### Storage

- Selected language is stored in `localStorage` as `krishiSetuLanguage`
- HTML document language is set via `document.documentElement.lang`

## Performance Considerations

- All translation files are loaded at build time
- Language switching is instant (no API calls)
- Translation lookup is O(n) based on key depth
- Minimal re-renders due to React context optimization

## Future Enhancements

Consider implementing:
1. **Right-to-Left (RTL) Support** for Arabic/Urdu
2. **Language Detection** - Auto-detect from browser settings
3. **Translation Management UI** - Admin panel for translations
4. **Pluralization** - Handle singular/plural forms
5. **Date/Number Formatting** - Locale-specific formatting

## Troubleshooting

### Translation Not Appearing

Check if:
1. Key exists in the JSON file
2. Key path is correct (use dot notation)
3. Component is wrapped with `LanguageProvider`

### useLanguage Hook Error

Ensure:
1. Component is inside a `LanguageProvider`
2. Hook is imported correctly
3. No extra spaces in key names

### Language Not Persisting

Check browser `localStorage` settings and clear if needed:
```javascript
localStorage.removeItem('krishiSetuLanguage')
```

---

**Happy Multi-Lingual Development!** 🌍
