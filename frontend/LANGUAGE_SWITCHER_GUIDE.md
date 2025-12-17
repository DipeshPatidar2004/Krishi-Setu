# Language Switcher - Visual Guide

## 🌍 Where to Find the Language Switcher

The language switcher is located in the **top-right corner of the Navbar**.

```
┌─────────────────────────────────────────────────────────┐
│ Krishi Setu  Home | Marketplace | Equipment | Government │
│                                                   [EN|हिं|मरा]
│                                                 ^ Language
│                                                   Buttons
└─────────────────────────────────────────────────────────┘
```

## 🎯 How It Works

### Step 1: Default State (English)
```
Language Button: [EN] हिं  मरा
                 ▲ Active (green background)
```
The English button is highlighted, indicating English is active.

### Step 2: Click Hindi
```
User clicks "हिं" button
↓
EN [हिं] मरा
    ▲ Now active
```
Everything switches to Hindi instantly.

### Step 3: Click Marathi
```
User clicks "मरा" button
↓
EN  हिं [मरा]
         ▲ Now active
```
Everything switches to Marathi instantly.

---

## 📱 Responsive Design

### Desktop View
```
[Krishi Setu] Home Marketplace Equipment Government [EN|हिं|मरा] [Login]
```

### Mobile View (Assumed)
The language switcher remains accessible in the navbar.

---

## 🎨 Button Styles

### Inactive Button
```css
Background: Light Gray (#E5E7EB)
Text Color: Dark Gray
Padding: 4px 12px 4px 12px
Border Radius: 6px
Font Size: 0.875rem (14px)
Font Weight: Medium (500)
```

### Active Button (Selected)
```css
Background: Primary Green (#16A34A)
Text Color: White
Padding: 4px 12px 4px 12px
Border Radius: 6px
Font Size: 0.875rem (14px)
Font Weight: Medium (500)
```

---

## 💻 Component Code

The language switcher is implemented in:
**File:** `src/components/LanguageSwitcher.jsx`

```jsx
import { useLanguage } from '../hooks/useLanguage'

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition ${
          language === 'en'
            ? 'bg-primary-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition ${
          language === 'hi'
            ? 'bg-primary-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        हिं
      </button>
      <button
        onClick={() => setLanguage('mr')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition ${
          language === 'mr'
            ? 'bg-primary-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        मरा
      </button>
    </div>
  )
}
```

---

## 🔄 User Journey

### First Time Visitor
1. Lands on website (defaults to English)
2. Sees language buttons in navbar
3. Clicks any language button
4. Website instantly translates
5. Language choice is saved

### Returning Visitor
1. Lands on website
2. Previously selected language auto-loads (from localStorage)
3. Can change language anytime via switcher

---

## 🛑 Important Notes

✅ **Language switcher** - Top-right navbar
✅ **Active state** - Highlighted in green
✅ **Instant** - Changes apply immediately
✅ **Persistent** - Choice saved in browser
✅ **Responsive** - Works on all screen sizes

---

## 📍 Navigation Path

To integrate or modify:
```
src/
├── components/
│   ├── Navbar.jsx ← Contains LanguageSwitcher
│   └── LanguageSwitcher.jsx ← The switcher component
│
└── context/
    ├── LanguageContext.jsx
    └── LanguageProvider.jsx ← Manages language state
```

---

## 🎬 Quick Demo

### Command Line
```bash
npm run dev
```

### In Browser
1. Open http://localhost:5173
2. Look at navbar (top-right corner)
3. See "EN हिं मरा" buttons
4. Click any button
5. Notice entire page translates instantly!

---

## ⚡ Technical Details

### Storage Location
- **Key:** `krishiSetuLanguage`
- **Where:** Browser localStorage
- **Data:** Language code ('en', 'hi', or 'mr')

### Supported Codes
| Code | Language | Display |
|------|----------|---------|
| en | English | EN |
| hi | हिंदी | हिं |
| mr | मराठी | मरा |

### Default Language
- **English** (EN)
- User can immediately change to any language

---

## 🔍 Testing Checklist

- [ ] Language switcher visible in navbar
- [ ] Buttons are responsive (hover effects)
- [ ] Clicking buttons changes language
- [ ] Language persists after page refresh
- [ ] All components translate correctly
- [ ] No text overflow in any language
- [ ] Buttons work on mobile/desktop

---

## 🎓 Learning Resources

- **Full Guide:** `MULTILINGUAL_GUIDE.md`
- **Quick Start:** `QUICKSTART_LANGUAGES.md`
- **Summary:** `LANGUAGE_IMPLEMENTATION_SUMMARY.md`
- **This File:** Visual reference for language switcher

---

## ✨ Features

🟢 **Easy to Use** - One-click language switching
🟢 **Persistent** - Saves user preference
🟢 **Fast** - Instant translation (no API calls)
🟢 **Scalable** - Easy to add more languages
🟢 **Accessible** - Clear button labels

---

**That's it!** Your website is ready for multi-language support! 🎉
