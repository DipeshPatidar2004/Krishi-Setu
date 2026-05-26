# Quick Start: Multi-Language Implementation

## What's New ✨

Your Krishi Setu website now supports **3 languages**:
- 🇬🇧 English
- 🇮🇳 Hindi (हिंदी)
- 🇮🇳 Marathi (मराठी)

## How to Use

### For Users
1. Look for the language switcher in the **top navbar** (EN / हिं / मरा buttons)
2. Click any button to change the language
3. The entire website will translate instantly
4. Your language choice is **saved automatically**

### For Developers

#### To Add Translations to a Component

**Step 1:** Import the hook
```jsx
import { useLanguage } from '../hooks/useLanguage'
```

**Step 2:** Use it in your component
```jsx
const MyComponent = () => {
  const { t } = useLanguage()
  
  return <h1>{t('section.key')}</h1>
}
```

**Step 3:** Add translations to JSON files
```json
// src/locales/en.json
{
  "section": {
    "key": "Your English text here"
  }
}

// src/locales/hi.json
{
  "section": {
    "key": "यहाँ आपका हिंदी पाठ"
  }
}

// src/locales/mr.json
{
  "section": {
    "key": "येथे आपला मराठी मजकूर"
  }
}
```

## File Structure

```
src/
├── locales/
│   ├── en.json       # English translations
│   ├── hi.json       # Hindi translations
│   └── mr.json       # Marathi translations
├── context/
│   ├── LanguageContext.jsx      # Context definition
│   └── LanguageProvider.jsx      # Provider component
├── hooks/
│   └── useLanguage.js            # Hook for using translations
├── components/
│   └── LanguageSwitcher.jsx      # Language selector buttons
└── App.jsx                       # Wrapped with LanguageProvider
```

## Key Features

✅ **Easy to Use** - Simple `t()` function for translations
✅ **Persistent** - Language choice saved in localStorage
✅ **Performant** - All translations loaded at startup
✅ **Scalable** - Easy to add more languages
✅ **Variables** - Support for dynamic content like `{{name}}`

## Complete Example

```jsx
import { useLanguage } from '../hooks/useLanguage'

const ExampleComponent = () => {
  const { t, language } = useLanguage()

  return (
    <div>
      <h1>{t('example.title')}</h1>
      <p>{t('example.description')}</p>
      <p>Current: {language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : 'मराठी'}</p>
    </div>
  )
}

export default ExampleComponent
```

## Translation with Variables

```json
{
  "greeting": "Hello, {{name}}! Welcome to {{company}}"
}
```

Usage:
```jsx
t('greeting', { name: 'John', company: 'Krishi Setu' })
// Output: "Hello, John! Welcome to Krishi Setu"
```

## Already Translated Components

These components have been updated with full multi-language support:
- ✅ Navbar
- ✅ Hero
- ✅ Features
- ✅ Footer

## Next Steps

1. **Update Remaining Components** - Add `useLanguage()` hook to:
   - Marketplace.jsx
   - EquipmentRental.jsx
   - Government.jsx
   - Login.jsx
   - Register.jsx
   - BuyerRegister.jsx

2. **Add New Languages** - Follow the "Adding New Languages" section in MULTILINGUAL_GUIDE.md

3. **Test** - Run `npm run dev` and test language switching

## Testing

```bash
# Start development server
npm run dev

# Open http://localhost:5173
# Click language buttons in navbar
# Verify translations appear correctly
```

## Useful Files Reference

| File | Purpose |
|------|---------|
| `src/context/LanguageContext.jsx` | Define context |
| `src/context/LanguageProvider.jsx` | Provide translations globally |
| `src/hooks/useLanguage.js` | Use translations in components |
| `src/components/LanguageSwitcher.jsx` | Language selector UI |
| `src/locales/*.json` | Translation strings |
| `MULTILINGUAL_GUIDE.md` | Full documentation |

## Troubleshooting

**Q: Language not changing?**
- Make sure App.jsx is wrapped with `<LanguageProvider>`
- Check browser console for errors

**Q: Translation showing as key name?**
- Verify the key exists in all three JSON files
- Check for typos in the key path

**Q: Component not updating?**
- Ensure you're using the `t()` function correctly
- Component must be inside the LanguageProvider

---

**You're all set!** 🎉

Start by running the development server:
```bash
npm run dev
```

For detailed documentation, see `MULTILINGUAL_GUIDE.md`
