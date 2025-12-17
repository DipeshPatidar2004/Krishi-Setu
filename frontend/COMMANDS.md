# 🔧 COMMAND QUICK REFERENCE

## 🚀 START HERE

```powershell
# Navigate to project
cd "C:\Users\harsh\OneDrive\Desktop\krishi-setu\krishi-setu"

# Start development server
npm run dev

# Open in browser
http://localhost:5173
```

---

## 📍 LANGUAGE SWITCHER LOCATION

In navbar (top-right):
```
[🇬🇧 EN ▼]  ← Click here to change language
```

---

## ✨ WHAT YOU GET

✅ English (EN)
✅ Hindi (हिंदी)
✅ Marathi (मराठी)
✅ Instant translation
✅ Auto-saved language preference

---

## 📂 KEY FILES

**Translations:**
- `src/locales/en.json`
- `src/locales/hi.json`
- `src/locales/mr.json`

**Language System:**
- `src/context/LanguageProvider.jsx`
- `src/hooks/useLanguage.js`
- `src/components/LanguageSwitcher.jsx`

**Updated Components:**
- `src/components/Navbar.jsx`
- `src/App.jsx`

---

## 💻 DEVELOPER USAGE

```jsx
import { useLanguage } from '../hooks/useLanguage'

const MyComponent = () => {
  const { t } = useLanguage()
  return <h1>{t('nav.home')}</h1>
}
```

---

## 📖 DOCUMENTATION

Start with these files (in order):

1. `START_HERE.md` ← You are here
2. `README_QUICK_START.md`
3. `HOW_TO_USE_LANGUAGE_SWITCHER.md`
4. `SYSTEM_OVERVIEW.md`
5. `MULTILINGUAL_GUIDE.md`

---

## ⚡ QUICK COMMANDS

```powershell
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## ✅ VERIFICATION

Check in browser at http://localhost:5173:

✓ Green language button in navbar (top-right)
✓ Click button → dropdown appears
✓ Select language → page translates
✓ Reload page → language persists

---

## 🐛 TROUBLESHOOTING

**Server not starting:**
```powershell
npm install
npm run dev
```

**Port in use:**
```powershell
# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <number> /F
npm run dev
```

**Styling broken:**
- Hard refresh: Ctrl+Shift+R
- Check browser console (F12)

---

## 🎯 ONE-LINER

```powershell
cd "C:\Users\harsh\OneDrive\Desktop\krishi-setu\krishi-setu"; npm run dev
```

Then open: **http://localhost:5173**

---

## 🌍 THAT'S IT!

Your multi-language website is ready to use! 🎉

**Enjoy! 🚀**
