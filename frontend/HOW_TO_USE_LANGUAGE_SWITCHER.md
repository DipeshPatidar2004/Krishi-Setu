# 🌍 How to Use the Language Switcher

## Step-by-Step Guide

### Step 1: Start the Development Server
Open PowerShell in your project folder and run:

```powershell
npm run dev
```

You should see:
```
VITE v7.2.2  ready in 2575 ms
➜  Local:   http://localhost:5173/
```

### Step 2: Open in Browser
Go to: **http://localhost:5173**

### Step 3: Find the Language Button
Look at the **top-right area of the navbar** (after the menu items):

```
[Logo]  Home | Marketplace | Equipment | Government  [🌐 EN ▼]  [Login]
                                                       ↑
                                            Language Switcher Button
```

### Step 4: Click the Language Button
The button shows:
- 🇬🇧 (Flag)
- **EN** (Current language code)
- **▼** (Dropdown arrow)

### Step 5: Select Your Language
A dropdown menu appears:

```
┌────────────────────────────────┐
│  🇬🇧 English                    │
│       EN                        │
│                                │
│  🇮🇳 हिंदी                       │
│       हिं                        │
│                                │
│  🇮🇳 मराठी                       │
│       मरा                        │
└────────────────────────────────┘
```

### Step 6: Choose Your Language
Click any option:
- **English** → Entire website switches to English
- **हिंदी** → Entire website switches to Hindi
- **मराठी** → Entire website switches to Marathi

### Step 7: Automatic Saving
Your choice is **automatically saved** in browser storage. When you reload the page, it remembers your language!

---

## 🎯 Button Features

✅ **Dropdown Menu** - All languages in one clean button
✅ **Visual Feedback** - Shows current language with flag
✅ **Checkmark** - Selected language has a checkmark
✅ **Smooth Animation** - Arrow rotates when menu opens
✅ **Quick Access** - No page reload needed

---

## 📍 Exact Location in Code

**File:** `src/components/Navbar.jsx`

The language switcher is placed in the **top-right navbar** between the menu and login button:

```jsx
<div className="flex items-center space-x-4">
  <LanguageSwitcher />  {/* ← HERE */}
  {user ? (
    // User profile...
  ) : (
    <button onClick={onLoginClick}>
      {t('nav.login')}
    </button>
  )}
</div>
```

---

## 🎨 Visual Design

### Button Appearance
```
┌─────────────────────┐
│ 🇬🇧  EN      ▼      │  ← Active State (Green)
└─────────────────────┘
   └─ Flag  └─ Code  └─ Dropdown Arrow
```

### Dropdown Style
```
┌─────────────────────────────────┐
│ 🇬🇧 English          ✓          │  ← Selected
│       EN                        │
│─────────────────────────────────│
│ 🇮🇳 हिंदी                        │
│       हिं                        │
│─────────────────────────────────│
│ 🇮🇳 मराठी                        │
│       मरा                        │
└─────────────────────────────────┘
```

---

## 💡 Quick Demo

1. **Open browser**: http://localhost:5173
2. **Look for the green button** with flag and language code in navbar (top-right)
3. **Click it** to see dropdown
4. **Select a language** (e.g., हिं)
5. **Watch the entire page translate instantly!**
6. **Reload page** - language persists ✨

---

## 🔧 Technical Details

### File Locations
```
src/
├── components/
│   ├── Navbar.jsx ← Uses LanguageSwitcher
│   └── LanguageSwitcher.jsx ← The button component
├── context/
│   ├── LanguageContext.jsx
│   └── LanguageProvider.jsx
├── hooks/
│   └── useLanguage.js
└── locales/
    ├── en.json
    ├── hi.json
    └── mr.json
```

### How It Works
1. User clicks language button
2. `setLanguage()` updates context
3. All components using `t()` re-render
4. Language saved to localStorage
5. Page instantly translates

---

## ✨ Key Points

🟢 **One Button** - All language options in dropdown
🟢 **Always Visible** - Top-right navbar
🟢 **Instant** - No page refresh needed
🟢 **Persistent** - Saves selection
🟢 **Beautiful** - Modern dropdown design

---

## 📱 Works On

✅ Desktop
✅ Tablet
✅ Mobile (dropdown appears above button if needed)

---

## 🐛 Troubleshooting

**Q: Button not showing?**
- Make sure you're running `npm run dev`
- Check http://localhost:5173 loads correctly

**Q: Translation not changing?**
- Reload the page (Ctrl+R)
- Check browser console for errors

**Q: Button styling looks off?**
- Tailwind CSS might not be compiled
- Run `npm install` again
- Restart dev server with `npm run dev`

---

## 🚀 That's It!

Your multi-language website is **ready to use**! 

The language switcher is now a **single, beautiful button** in the navbar that controls everything.

**Enjoy! 🎉**
