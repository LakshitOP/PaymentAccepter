# ⚡ Quick Start - 5 Minute Setup

## TL;DR - If you just want to get it working quickly

### 1. Firebase Setup (2 minutes)

```bash
# Create collections in Firebase Console → Firestore
1. Create collection: "payments" (auto-generate IDs)
2. Create collection: "admins" 
   - Document ID: your-email@example.com
   - Fields: role = "admin"
3. Create collection: "config"
   - Document ID: "payment"
   - Fields: amount = 20
```

### 2. Firebase Security Rules (1 minute)

Copy-paste this into **Firestore Rules** tab:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Payments
    match /payments/{paymentId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (
        resource.data.email == request.auth.token.email ||
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email))
      );
      allow update: if exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }
    // Admins
    match /admins/{email} {
      allow read, write: if request.auth.token.email == email ||
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }
    // Config
    match /config/{document=**} {
      allow read: if true;
      allow write: if exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }
  }
}
```

### 3. Environment Variables (1 minute)

Update `.env.local` with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abc123
FIREBASE_ADMIN_SDK_KEY={"type":"service_account",...}
```

### 4. Create Admin (1 minute)

**In Firebase Auth:**
- Email: your-email@example.com
- Password: any strong password
- Click Create

### 5. Run & Test (1 minute)

```bash
npm run dev
```

Visit `http://localhost:3000` → Test all flows

---

## 🎯 Quick Links

- **User Payment Flow**: http://localhost:3000/user/dashboard
- **Admin Dashboard**: http://localhost:3000/admin/login
- **Payment History**: http://localhost:3000/user/payment-history
- **Firebase Console**: https://console.firebase.google.com/

---

## 🆘 5 Common Issues & Fixes

### ❌ "Firebase configuration is incomplete"

**Fix:** Check all `NEXT_PUBLIC_FIREBASE_*` variables are in `.env.local` (they must start with `NEXT_PUBLIC_`)

### ❌ Admin login says "Access denied"

**Fix:** 
1. Add email to Firestore `admins` collection (document ID = email)
2. Add field: `role: "admin"`
3. Refresh page

### ❌ Payment not saving

**Fix:**
1. Check Firestore Rules are correct
2. Check `payments` collection exists
3. Check user is logged in

### ❌ Admin can't see payments

**Fix:**
1. Check user is in admin collection
2. Check Firestore read/write rules
3. Verify admins collection document ID = admin email

### ❌ Real-time updates not working

**Fix:**
1. Check browser console for errors (F12)
2. Check user has read permissions in Firestore
3. Hard refresh (Ctrl+Shift+R)

---

## 🚀 For Production (Vercel)

### Step 1: Add domain to Firebase

Firebase Console → Settings → Authorized Domains → Add `your-project.vercel.app`

### Step 2: Add env vars to Vercel

Vercel → Project → Settings → Environment Variables → Add all vars

### Step 3: Deploy

```bash
git push origin main  # Auto-deploys!
```

### Step 4: Verify

Visit `https://your-project.vercel.app` → Test

---

## 📚 Full Guides

- Complete Setup: See [MANUAL_UPI_SYSTEM_SETUP.md](./MANUAL_UPI_SYSTEM_SETUP.md)
- Production Deployment: See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

---

**That's it! You're ready to go!** 🎉
