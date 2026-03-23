# 🐛 COMPLETE TROUBLESHOOTING & ERROR GUIDE

This document contains EVERY possible error you might see and how to fix it.

---

## 🔴 CRITICAL ERRORS (Blocks App Launch)

### ERROR: "Module not found: can't resolve '@tailwindcss/postcss'"

**What causes it:**
Missing Tailwind CSS PostCSS plugin package

**Where you'll see it:**
```
Error: Could not load postcss config
Module not found: Post CSS plugin
```

**How to fix:**
```bash
npm install -D @tailwindcss/postcss
npm run dev
```

---

### ERROR: "FIREBASE_ADMIN_SDK_KEY is not valid JSON"

**What causes it:**
Firebase Admin key is malformed in `.env.local`

**Where you'll see it:**
Console during startup:
```
Error: FIREBASE_ADMIN_SDK_KEY is not valid JSON
Unexpected token \ in JSON at position 0
```

**How to fix:**
👉 See: [FIX_FIREBASE_KEY.md](./FIX_FIREBASE_KEY.md)

**Quick fix:**
1. Get new private key from Firebase Console
2. Convert to single line JSON
3. Paste into `.env.local` FIREBASE_ADMIN_SDK_KEY
4. Restart `npm run dev`

---

### ERROR: "Firebase: Error (auth/invalid-api-key)"

**What causes it:**
Firebase public keys are incomplete or invalid

**Where you'll see it:**
```
Firebase config:
- NEXT_PUBLIC_FIREBASE_API_KEY ← is this empty?
- NEXT_PUBLIC_FIREBASE_PROJECT_ID ← is this empty?
```

**How to fix:**
Check `.env.local` - all NEXT_PUBLIC_FIREBASE_* should be filled:

```
✓ NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDJxE...
✓ NEXT_PUBLIC_FIREBASE_PROJECT_ID=testcase-f67c9
✓ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=testcase-f67c9.firebaseapp.com
✓ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=testcase-f67c9.appspot.com
✓ FIREBASE_ADMIN_SDK_KEY={...}
```

If any are empty or invalid, regenerate from Firebase Console.

---

### ERROR: "Port 3000 is already in use"

**What causes it:**
Another process is using port 3000

**Where you'll see it:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**How to fix:**

**Option 1: Kill the process**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Mac/Linux
lsof -i :3000
kill -9 [PID_NUMBER]
```

**Option 2: Use different port**
```bash
PORT=3001 npm run dev
```

---

## 🟡 WARNING ERRORS (Don't Block App)

### ERROR: "Firebase configuration is incomplete"

**What causes it:**
Some Firebase keys are missing or empty (app still runs)

**Where you'll see it:**
Browser console warning:
```
⚠️ Firebase configuration incomplete
```

**How to fix:**
Fill in all Firebase variables in `.env.local` from Firebase Console

**Impact:**
- ❌ Authentication won't work
- ✅ App pages will load
- ✅ Design will display

---

### ERROR: "Razorpay failed to load"

**What causes it:**
NEXT_PUBLIC_RAZORPAY_KEY_ID is empty

**Where you'll see it:**
User dashboard - "Pay ₹20" button doesn't work

**How to fix:**
1. Check `.env.local`:
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_SUiiwWaMODnhrZ
RAZORPAY_KEY_SECRET=j4zZJqiB2YCgiNqBfZjqG4Fd
```

2. If empty, add Razorpay test keys:
   - Key ID: `rzp_test_SUiiwWaMODnhrZ`
   - Secret: `j4zZJqiB2YCgiNqBfZjqG4Fd`

3. Restart dev server

---

### ERROR: "Google popup not opening"

**What causes it:**
NEXT_PUBLIC_GOOGLE_CLIENT_ID is empty OR popup is blocked

**Where you'll see it:**
User Login page - clicking Google button does nothing

**How to fix:**

**Option 1: Allow popups**
- Click lock icon in URL bar
- Allow popups for localhost:3000

**Option 2: Add Google credentials**
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials (Web)
3. Add redirect URI: `http://localhost:3000/user/login`
4. Copy Client ID and add to `.env.local`:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

**Option 3: Skip Google (use email instead)**
- For development, use email/password admin login
- Google login is optional

---

## 🟢 PAGE LOADING ERRORS

### ERROR: "Admin dashboard displays empty table"

**What causes it:**
No admin user created in Firestore

**Where you'll see it:**
Admin dashboard shows "No transactions found"

**How to fix:**
1. Create admin user in Firestore:
   - Collection: `admins`
   - Document ID: `admin@example.com`
   - Fields: `{ email: "admin@example.com", isAdmin: true, createdAt: new Date() }`

2. Create user in Firebase Auth:
   - Email: `admin@example.com`
   - Password: `Admin@123`

3. Login to admin panel

---

### ERROR: "User dashboard blank or gray"

**What causes it:**
Firebase auth not initialized

**Where you'll see it:**
Empty page or loading state forever

**How to fix:**

**Step 1: Check Firebase config**
```
✓ All NEXT_PUBLIC_FIREBASE_* filled?
✓ FIREBASE_ADMIN_SDK_KEY valid?
```

**Step 2: Check auth state**
Open browser console and run:
```javascript
firebase.auth().currentUser
```

Should show a user object if logged in.

**Step 3: Force logout and restart**
```bash
# Clear browser storage
1. Press F12 → Application tab
2. Clear Cookies and Local Storage
3. Refresh page
4. Try logging in again
```

---

### ERROR: "Payment modal won't open"

**What causes it:**
Razorpay SDK not loading

**Where you'll see it:**
User dashboard - "Pay ₹20" button is disabled

**How to fix:**
1. Check browser console for errors
2. Verify Razorpay keys in `.env.local`
3. Check if popup is blocked (allow popups)
4. Verify user is authenticated (should see email displayed)

---

## 🔵 API ENDPOINT ERRORS

### ERROR: "POST /api/payment/create-order returns 400"

**What causes it:**
Missing required fields in request

**Expected request:**
```json
{
  "userId": "abc123",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**How to fix:**
- Ensure user is logged in (has UID)
- Ensure Firestore has user profile with email/name
- Check network tab for what was sent

---

### ERROR: "Payment verification fails - signature invalid"

**What causes it:**
RAZORPAY_KEY_SECRET is wrong or corrupted

**Where you'll see it:**
After payment, error: "Payment verification failed"

**How to fix:**
1. Check `.env.local`:
```
RAZORPAY_KEY_SECRET=j4zZJqiB2YCgiNqBfZjqG4Fd
```

2. Get fresh keys from Razorpay Dashboard
3. Update `.env.local`
4. Restart `npm run dev`

---

### ERROR: "Admin transaction verify endpoint returns 401"

**What causes it:**
Admin not authenticated or not in admins collection

**How to fix:**
1. Make sure you're logged in as admin
2. Verify admin document exists in Firestore:
   - Collection: `admins`
   - Document ID: your email
   - Field: `isAdmin: true`

---

## 🟣 BUILD & COMPILATION ERRORS

### ERROR: "Type 'any' is not assignable to type 'User'"

**What causes it:**
TypeScript type mismatch

**Where you'll see it:**
```
npm run build output:
error TS2345: Argument of type 'any' is not assignable to parameter of type 'User'
```

**How to fix:**
The code already handles this, but if you see it:
```typescript
// Add : any type annotation
const handleResult = (user: any) => {
  // code here
}
```

---

### ERROR: "Cannot find module or its corresponding type declarations"

**What causes it:**
Missing package

**Where you'll see it:**
```
Cannot find module 'firebase/auth'
```

**How to fix:**
```bash
npm install firebase-admin firebase
npm run build
```

---

### ERROR: "Unexpected token" in tailwind config

**What causes it:**
Tailwind CSS v4 uses different syntax

**How to fix:**
Check `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

## 🟠 RUNTIME ERRORS (After Launch)

### ERROR: "Cannot read property 'uid' of null"

**What causes it:**
User not authenticated but trying to access user data

**Where you'll see it:**
User dashboard error

**How to fix:**
1. Redirect to login page if no user
2. Check if auth is initialized:
```typescript
'use client';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';

export default function Page() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);
  
  if (!user) return <div>Loading...</div>;
  
  return <div>Welcome {user.email}</div>;
}
```

---

### ERROR: "Firestore permission denied"

**What causes it:**
Firestore security rules block the operation

**Where you'll see it:**
Console error: "Missing or insufficient permissions"

**How to fix:**
Go to Firebase Console → Firestore → Rules
Set to development mode (allows all):
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ For production, use restrictive rules!

---

### ERROR: "Uncaught TypeError: Cannot read properties of undefined"

**What causes it:**
JavaScript trying to access undefined variable

**How to fix:**
1. Open browser DevTools (F12)
2. Look at console for full error
3. Find the line number
4. Add null checks:

```typescript
// Instead of: obj.field
// Use: obj?.field || 'default value'
```

---

## ✅ HOW TO TEST EACH ERROR

### Test Payment Flow
```
1. Start dev server: npm run dev
2. Open http://localhost:3000/user/login
3. Enter test credentials
4. Click "Pay ₹20"
5. Use test card: 4111 1111 1111 1111
6. OTP: 123456 or any 6 digits
7. See success animation
8. Go to admin dashboard to verify
```

### Test Admin Flow
```
1. Open http://localhost:3000/admin/login
2. Login: admin@example.com / Admin@123
3. See pending transactions
4. Click "Verify" on any transaction
5. Transaction moves to verified
```

### Test Authentication
```
1. Open browser DevTools (F12)
2. Go to Application tab
3. Check localStorage has Firebase tokens
4. Check cookies for session data
```

---

## 🎯 ERROR PRIORITY FIX ORDER

**FIX THESE FIRST (blocks everything):**
1. Firebase Admin SDK key format → [FIX_FIREBASE_KEY.md](./FIX_FIREBASE_KEY.md)
2. Module not found errors → `npm install`
3. Port already in use → Kill process or change port

**FIX THESE SECOND (blocks features):**
4. Firebase config incomplete → Fill in .env.local
5. Admin not found → Create admin user in Firestore
6. Razorpay keys missing → Add keys to .env.local

**FIX THESE LAST (optional features):**
7. Google OAuth not working → Optional, skip for now
8. UPI image not loading → Optional, add later

---

## 🆘 STILL STUCK?

### Check these files in order:
1. `.env.local` - Are all variables filled?
2. `firebase.json` - Correct project?
3. Browser console (F12) - What's the exact error?
4. Terminal output - Any build errors?
5. Network tab - API calls succeeding?

### Try these commands:
```bash
# Clear everything
rm -r node_modules
npm install

# Clean rebuild
npm run build

# Fresh start
npm run dev
```

### Get more info:
- Firebase Console: https://console.firebase.google.com
- Razorpay Dashboard: https://dashboard.razorpay.com
- Next.js Docs: https://nextjs.org/docs

---

**Remember: Most errors are just missing environment variables or misconfigured credentials! 🔑**
