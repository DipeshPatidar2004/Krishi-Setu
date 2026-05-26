# 🧪 Testing Guide - Multi-Language Implementation

## Quick Test (2 minutes)

### 1. Start the Development Server
```bash
cd c:\Users\harsh\OneDrive\Desktop\krishi-setu\krishi-setu
npm install  # If not already done
npm run dev
```

### 2. Open in Browser
- Go to: `http://localhost:5173`
- You should see the Krishi Setu website in **English** by default

### 3. Find Language Switcher
- Look at the **top-right corner** of the navbar
- You'll see three buttons: **EN | हिं | मरा**

### 4. Test Language Switching
```
Click "हिं" (Hindi)
↓
Entire page should switch to Hindi
- Hero title changes
- Buttons text changes
- Navigation items change
- Everything should be in Hindi/Devanagari script

Click "मरा" (Marathi)
↓
Entire page should switch to Marathi
- All content updates to Marathi script
- Same layout, different text

Click "EN" (English)
↓
Returns to English
- All content back to English
```

### 5. Test Persistence
```
1. Current language is Hindi
2. Close browser tab (or navigate away)
3. Return to http://localhost:5173
4. Language should still be Hindi!
   (Your choice was saved)

This proves localStorage is working ✓
```

---

## 🔍 Detailed Testing

### Test 1: Language Switcher Visibility

**Expected Result:** Three language buttons visible in navbar
```
Navbar Layout:
[Krishi Setu Logo] [Home] [Marketplace] [Equipment] [Government] [EN|हिं|मरा] [Login]
                                                                  ↑
                                                         Language Switcher
```

**Pass/Fail:** 
- ✅ PASS - All buttons visible and properly spaced
- ❌ FAIL - Buttons missing or misaligned

---

### Test 2: Active Language Highlighting

**Expected Result:** Selected language button highlighted in green

```
Before clicking:
[EN] हिं  मरा    ← EN has green background

After clicking Hindi:
EN [हिं] मरा    ← हिं has green background (EN now gray)

After clicking Marathi:
EN  हिं [मरा]   ← मरा has green background (हिं now gray)
```

**Pass/Fail:**
- ✅ PASS - Correct button highlighted when clicked
- ❌ FAIL - Highlighting not working

---

### Test 3: Navigation Items Translation

**Check These Elements:**

| Component | English | Hindi | Marathi |
|-----------|---------|-------|---------|
| Home | Home | होम | होम |
| Marketplace | Marketplace | बाजार | बाजार |
| Equipment | Equipment Rental | उपकरण किराया | उपकरण भाडे |
| Government | Government Portal | सरकारी पोर्टल | सरकारी पोर्टल |
| Login | Login | लॉगिन | लॉगइन |

**How to Test:**
1. Click each language button
2. Check if navigation text changes correctly
3. Verify text matches table above

**Pass/Fail:**
- ✅ PASS - All navigation items translate correctly
- ❌ FAIL - Some items don't translate

---

### Test 4: Hero Section Translation

**Check These Elements:**

1. **Main Title**
   - EN: "Empowering Farmers Through Digital Transparency"
   - Should translate to Hindi/Marathi

2. **Subtitle**
   - EN: "Krishi Setu bridges the gap..."
   - Should translate to Hindi/Marathi

3. **Buttons**
   - EN: "Register as Farmer" / "Register as Buyer"
   - Should translate to Hindi/Marathi

4. **Statistics Section**
   - "40%", "8.4%", "100%"
   - Labels should translate

**Pass/Fail:**
- ✅ PASS - All hero text translates correctly
- ❌ FAIL - Some text doesn't translate

---

### Test 5: Features Section Translation

**Check These Elements:**

All 6 feature titles and descriptions should translate:
1. Direct Market Access
2. Government Supervised Tenders
3. Secure Payment System
4. Equipment Rental
5. Real-time Price Discovery
6. Simple Digital Platform

**How to Test:**
1. Scroll down to Features section
2. Click each language button
3. Verify all 6 features translate

**Pass/Fail:**
- ✅ PASS - All features translate
- ❌ FAIL - Some features untranslated

---

### Test 6: Footer Translation

**Check These Elements:**
- About Us text
- Quick Links labels
- Contact Info labels
- Copyright year (dynamic)
- Developer names

**Pass/Fail:**
- ✅ PASS - Footer fully translates
- ❌ FAIL - Some footer elements untranslated

---

### Test 7: localStorage Persistence

**Test Steps:**
```
1. Set language to Hindi (हिं)
2. Open Developer Tools (F12)
3. Go to Application → Local Storage
4. Look for key: "krishiSetuLanguage"
5. Value should be: "hi"

6. Refresh page (F5)
7. Language should still be Hindi
8. localStorage should still have "hi"

9. Change to Marathi (मरा)
10. localStorage should update to "mr"

11. Close and reopen browser
12. Should remember Marathi selection
```

**Pass/Fail:**
- ✅ PASS - localStorage working correctly
- ❌ FAIL - Language resets on refresh

---

### Test 8: Login/Register Components

**Note:** These haven't been fully updated yet.
They still show English text only.

**Future Work:**
- [ ] Add translations to Login.jsx
- [ ] Add translations to Register.jsx
- [ ] Add translations to BuyerRegister.jsx

**Current Status:** ⚠️ Partially Complete

---

### Test 9: Marketplace & Equipment Pages

**Note:** These pages haven't been fully updated yet.
Navigation shows but content may not translate.

**Future Work:**
- [ ] Add translations to Marketplace.jsx
- [ ] Add translations to EquipmentRental.jsx
- [ ] Add translations to Government.jsx (partially done)

**Current Status:** ⚠️ Partially Complete

---

## 🐛 Troubleshooting

### Issue: Language buttons not visible

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Restart dev server (npm run dev)

### Issue: Language not changing

**Solution:**
```javascript
// Open browser console (F12)
// Check for errors

// Manually test translation function:
// Go to any component and check console logs

// Clear localStorage:
localStorage.removeItem('krishiSetuLanguage')

// Restart server and test again
```

### Issue: Text appears as [key name] instead of translation

**Solution:**
1. Check that JSON files exist in `src/locales/`
2. Verify key exists in all 3 language files
3. Check for typos in key path
4. Example: `t('nav.home')` - both "nav" and "home" must exist

### Issue: Wrong language showing

**Solution:**
```javascript
// Open console and type:
localStorage.clear()

// Then refresh page:
window.location.reload()

// Check localStorage is reset:
localStorage.getItem('krishiSetuLanguage')  // Should be null
```

---

## 📊 Test Results Form

Copy this and fill out:

```
=== MULTI-LANGUAGE TESTING RESULTS ===

Date: [_______________]
Tester: [______________]

TEST 1 - Language Switcher Visible
Result: ☐ PASS ☐ FAIL
Notes: _______________________

TEST 2 - Highlighting Works
Result: ☐ PASS ☐ FAIL
Notes: _______________________

TEST 3 - Navigation Translates
Result: ☐ PASS ☐ FAIL
Notes: _______________________

TEST 4 - Hero Section Translates
Result: ☐ PASS ☐ FAIL
Notes: _______________________

TEST 5 - Features Section Translates
Result: ☐ PASS ☐ FAIL
Notes: _______________________

TEST 6 - Footer Translates
Result: ☐ PASS ☐ FAIL
Notes: _______________________

TEST 7 - localStorage Works
Result: ☐ PASS ☐ FAIL
Notes: _______________________

TEST 8 - Login/Register
Result: ☐ PASS ☐ FAIL ☐ SKIP (Not yet updated)
Notes: _______________________

TEST 9 - Marketplace/Equipment
Result: ☐ PASS ☐ FAIL ☐ SKIP (Not yet updated)
Notes: _______________________

OVERALL RESULT: ☐ PASS ☐ FAIL (with known limitations)

Overall Notes:
_________________________________
_________________________________
```

---

## ✅ Final Verification Checklist

Before considering implementation complete, verify:

### Phase 1: Core Functionality ✓
- [x] Language switcher visible in navbar
- [x] Three languages working (EN, HI, MR)
- [x] Language persists across sessions
- [x] No console errors

### Phase 2: Content Translation ✓
- [x] Navbar translates
- [x] Hero section translates
- [x] Features section translates
- [x] Footer translates

### Phase 3: Remaining Components ⏳
- [ ] Marketplace component
- [ ] Equipment Rental component
- [ ] Government Portal component
- [ ] Login component
- [ ] Register component
- [ ] Buyer Register component

### Phase 4: Quality Assurance ⏳
- [ ] No text overflow in any language
- [ ] All fonts display correctly
- [ ] Mobile responsiveness verified
- [ ] Performance tested

---

## 🎯 Success Criteria

✅ **SUCCESS** if:
- Language switcher works
- All 3 languages function correctly
- Translation persists in localStorage
- No console errors
- All updated components translate

⚠️ **KNOWN LIMITATIONS:**
- Login/Register components not yet updated
- Marketplace/Equipment/Government pages not yet updated
- These can be updated following the same pattern

---

## 📞 Need Help?

1. Check **MULTILINGUAL_GUIDE.md** for detailed documentation
2. Review **QUICKSTART_LANGUAGES.md** for usage examples
3. Look at **LANGUAGE_SWITCHER_GUIDE.md** for UI reference

---

**Happy Testing!** 🧪✨
